
# -*- coding: utf-8 -*-
"""algoritmo_match_v2_4_full.py
Algoritmo de Match Jurídico Inteligente — v2.4 (versão completa)
================================================================
**Principais componentes**

* 8 features (A, S, T, G, Q, U, R, C) — mesmas da v2.3
* Pesos dinâmicos por preset e pela complexidade do caso
* β-layer:
    - carga de trabalho (equity)
    - diversidade (τ, λ configuráveis via ENV)
* Multiplicador de êxitos (Verificado / Parcial / Não verificado)
* Redis cache (TTL 24h) para features estáticas
* Anti-spam em reviews via trust‑factor
* Invalidação ativa de cache (`invalidate_cache`)
* Auditoria JSON (stdout) com `raw`, `fair`, `diversity_boost`, etc.
"""
from __future__ import annotations

import atexit
import asyncio
import json
import logging
import os
import time
from dataclasses import dataclass, field
from math import asin, cos, log1p, radians, sin, sqrt
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np  # type: ignore
import redis.asyncio as aioredis  # type: ignore

# --------------------------------------------------------------------------- #
# 1. Configurações globais
# --------------------------------------------------------------------------- #
EMBEDDING_DIM = 384
RAIO_GEOGRAFICO_KM = 50
MIN_EPSILON = 0.05
BETA_EQUITY = 0.30
OVERLOAD_FLOOR = 0.05

# Fairness configurável sem redeploy
DIVERSITY_TAU = float(os.getenv("DIV_TAU", "0.30"))
DIVERSITY_LAMBDA = float(os.getenv("DIV_LAMBDA", "0.05"))

# Pesos base
DEFAULT_WEIGHTS = {
    "A": 0.30, "S": 0.25, "T": 0.15, "G": 0.10,
    "Q": 0.10, "U": 0.05, "R": 0.05, "C": 0.03
}
PRESET_WEIGHTS = {
    "fast": {
        "A": 0.40, "S": 0.15, "T": 0.20, "G": 0.15,
        "Q": 0.05, "U": 0.03, "R": 0.02, "C": 0.00
    },
    "expert": {
        "A": 0.25, "S": 0.30, "T": 0.15, "G": 0.05,
        "Q": 0.15, "U": 0.05, "R": 0.03, "C": 0.02
    },
    "balanced": DEFAULT_WEIGHTS
}

_current_weights: Dict[str, float] = {}
WEIGHTS_FILE = Path(__file__).parent / "models/ltr_weights.json"

def load_weights() -> Dict[str, float]:
    """Lê pesos do JSON externo, fallback para DEFAULT_WEIGHTS."""
    global _current_weights
    try:
        if WEIGHTS_FILE.exists():
            with open(WEIGHTS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if any(v > 0 for v in data.values()):
                    _current_weights = data
                    return data
        raise FileNotFoundError
    except Exception:
        _current_weights = DEFAULT_WEIGHTS
        return DEFAULT_WEIGHTS

load_weights()

def load_preset(preset: str) -> Dict[str, float]:
    return PRESET_WEIGHTS.get(preset, DEFAULT_WEIGHTS)

# --------------------------------------------------------------------------- #
# 2. Infra de auditoria & cache
# --------------------------------------------------------------------------- #
class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "ts": self.formatTime(record, self.datefmt),
            "lvl": record.levelname,
            "msg": record.getMessage(),
            "extra": getattr(record, "extra", {})
        })

AUDIT = logging.getLogger("audit.match")
_hdl = logging.StreamHandler()
_hdl.setFormatter(JsonFormatter())
AUDIT.addHandler(_hdl)
AUDIT.setLevel(logging.INFO)

class RedisCache:
    """TTL 24h — guarda features estáticas (T, G, Q, R)."""
    def __init__(self, url: str):
        self._r = aioredis.from_url(url, decode_responses=True, socket_timeout=1)
        self._prefix = "match:cache"

    async def get(self, lid: str):
        raw = await self._r.get(f"{self._prefix}:{lid}")
        return json.loads(raw) if raw else None

    async def set(self, lid: str, data: Dict[str, float]):
        await self._r.set(f"{self._prefix}:{lid}", json.dumps(data), ex=86400)

    async def delete(self, lid: str):
        await self._r.delete(f"{self._prefix}:{lid}")

    async def close(self):
        await self._r.close()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
cache = RedisCache(REDIS_URL)

async def invalidate_cache(lawyer_id: str):
    """Chame quando KPI ou diversidade forem atualizados."""
    await cache.delete(lawyer_id)

# --------------------------------------------------------------------------- #
# 3. Utilidades matemáticas
# --------------------------------------------------------------------------- #
def haversine(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    lat1, lon1 = map(radians, a)
    lat2, lon2 = map(radians, b)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    return 2 * 6371 * asin(sqrt(h))

def cosine(v1: np.ndarray, v2: np.ndarray) -> float:
    denom = float(np.linalg.norm(v1) * np.linalg.norm(v2)) or 1e-9
    return float(np.dot(v1, v2) / denom)

# --------------------------------------------------------------------------- #
# 4. Modelos de dados
# --------------------------------------------------------------------------- #
@dataclass(slots=True)
class DiversityMeta:
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    pcd: Optional[bool] = None
    orientation: Optional[str] = None
    consent_ts: Optional[float] = None

@dataclass(slots=True)
class KPI:
    success_rate: float
    cases_30d: int
    capacidade_mensal: int
    avaliacao_media: float
    tempo_resposta_h: int
    cv_score: float = 0.0
    success_status: str = "N"    # 'V', 'P', 'N'

@dataclass(slots=True)
class Lawyer:
    id: str
    nome: str
    tags_expertise: List[str]
    geo_latlon: Tuple[float, float]
    curriculo_json: Dict[str, Any]
    kpi: KPI
    diversity: Optional[DiversityMeta] = None
    kpi_subarea: Dict[str, float] = field(default_factory=dict)
    kpi_softskill: float = 0.0
    case_outcomes: List[bool] = field(default_factory=list)
    casos_historicos_embeddings: List[np.ndarray] = field(default_factory=list)
    review_texts: List[str] = field(default_factory=list)
    last_offered_at: float = field(default_factory=time.time)
    scores: Dict[str, Any] = field(default_factory=dict)

@dataclass(slots=True)
class Case:
    id: str
    area: str
    subarea: str
    urgency_h: int
    coords: Tuple[float, float]
    complexity: str = "MEDIUM"
    summary_embedding: np.ndarray = field(default_factory=lambda: np.zeros(EMBEDDING_DIM, dtype=np.float32))

# --------------------------------------------------------------------------- #
# 5. Feature calculator
# --------------------------------------------------------------------------- #
class FeatureCalc:
    def __init__(self, case: Case, lawyer: Lawyer):
        self.c = case
        self.l = lawyer
        self.cv = lawyer.curriculo_json

    def area_match(self): return 1.0 if self.c.area in self.l.tags_expertise else 0.0

    def similarity(self):
        if not self.l.casos_historicos_embeddings: return 0.0
        sims = [cosine(self.c.summary_embedding, e) for e in self.l.casos_historicos_embeddings]
        if self.l.case_outcomes and len(self.l.case_outcomes) == len(sims):
            w = [1.0 if o else 0.8 for o in self.l.case_outcomes]
            return float(np.average(sims, weights=w))
        return float(np.mean(sims))

    def success_rate(self):
        mult = {"V": 1.0, "P": 0.4, "N": 0.0}.get(self.l.kpi.success_status, 0.0)
        key = f"{self.c.area}/{self.c.subarea}"
        total = self.l.kpi.cases_30d or 1
        alpha = beta = 1
        granular = self.l.kpi_subarea.get(key)
        wins = int((granular if granular is not None else self.l.kpi.success_rate) * total)
        base = (wins + alpha) / (total + alpha + beta)
        return np.clip(base * mult, 0, 1)

    def geo_score(self):
        d = haversine(self.c.coords, self.l.geo_latlon)
        return np.clip(1 - d / RAIO_GEOGRAFICO_KM, 0, 1)

    def qualification(self):
        exp = min(1.0, self.cv.get("anos_experiencia", 0) / 25)
        titles = self.cv.get("pos_graduacoes", [])
        counts = {"lato": 0, "mestrado": 0, "doutorado": 0}
        for t in titles:
            lvl = str(t.get("nivel", "")).lower()
            if lvl in counts and self.c.area.lower() in str(t.get("area", "")).lower():
                counts[lvl] += 1
        score_titles = 0.1*min(counts['lato'],2)/2 + 0.2*min(counts['mestrado'],2)/2 + 0.3*min(counts['doutorado'],2)/2
        pubs = min(1.0, log1p(self.cv.get("num_publicacoes",0))/log1p(10))
        base = 0.4*exp + 0.4*score_titles + 0.2*pubs
        return 0.8*base + 0.2*self.l.kpi.cv_score

    def urgency(self):
        if self.c.urgency_h <= 0: return 0.0
        return np.clip(1 - self.l.kpi.tempo_resposta_h / self.c.urgency_h, 0, 1)

    def review(self):
        good = [t for t in self.l.review_texts if len(t.strip()) >= 20 and (len(set(t.split()))/len(t.split())) > 0.2]
        trust = min(1.0, len(good) / 5)
        return np.clip((self.l.kpi.avaliacao_media / 5) * trust, 0, 1)

    def soft_skill(self): return np.clip(self.l.kpi_softskill, 0, 1)

    def all(self):
        return {
            "A": self.area_match(),
            "S": self.similarity(),
            "T": self.success_rate(),
            "G": self.geo_score(),
            "Q": self.qualification(),
            "U": self.urgency(),
            "R": self.review(),
            "C": self.soft_skill(),
        }

# --------------------------------------------------------------------------- #
# 6. Engine de matchmaking
# --------------------------------------------------------------------------- #
class MatchEngine:
    @staticmethod
    def equity_weight(kpi: KPI):
        return 1 - kpi.cases_30d / kpi.capacidade_mensal if kpi.capacidade_mensal > kpi.cases_30d else OVERLOAD_FLOOR

    @staticmethod
    def dynamic_weights(case: Case, base: Dict[str, float]):
        w = base.copy()
        if case.complexity == "HIGH":
            w["Q"] += 0.05; w["T"] += 0.05; w["U"] -= 0.05; w["C"] += 0.02
        elif case.complexity == "LOW":
            w["U"] += 0.05; w["G"] += 0.03; w["Q"] -= 0.05; w["T"] -= 0.03
        total = sum(max(v,0) for v in w.values()) or 1
        return {k: max(v,0)/total for k,v in w.items()}

    @staticmethod
    def group_key(lawyer: Lawyer) -> str:
        return lawyer.diversity.gender if lawyer.diversity and lawyer.diversity.gender else "UNK"

    async def rank(self, case: Case, lawyers: List[Lawyer], top_n:int=5, preset:str="balanced") -> List[Lawyer]:
        if not lawyers: return []
        base_weights = (_current_weights or DEFAULT_WEIGHTS).copy()
        base_weights.update(load_preset(preset))
        weights = self.dynamic_weights(case, base_weights)

        for lw in lawyers:
            static = await cache.get(lw.id)
            if static:
                ex = FeatureCalc(case, lw)
                feats = static.copy()
                feats.update({"A": ex.area_match(), "S": ex.similarity(), "U": ex.urgency(), "C": ex.soft_skill()})
            else:
                ex = FeatureCalc(case, lw)
                feats = ex.all()
                await cache.set(lw.id, {k: feats[k] for k in ("T","G","Q","R")})
            delta = {k: weights[k]*feats[k] for k in DEFAULT_WEIGHTS}
            lw.scores = {"features": feats, "delta": delta, "raw": sum(delta.values())}

        best_raw = max(lw.scores["raw"] for lw in lawyers)
        eps = max(MIN_EPSILON, best_raw*0.10)
        elite = [lw for lw in lawyers if lw.scores["raw"] >= best_raw - eps]

        groups = {}
        for lw in elite:
            groups[self.group_key(lw)] = groups.get(self.group_key(lw), 0) + 1
        rep = {g: n/len(elite) for g, n in groups.items()}

        for lw in elite:
            eq = self.equity_weight(lw.kpi)
            boost = DIVERSITY_LAMBDA if rep.get(self.group_key(lw),1) < DIVERSITY_TAU else 0.0
            lw.scores["fair"] = (1-BETA_EQUITY)*lw.scores["raw"] + BETA_EQUITY*eq + boost
            lw.scores["diversity_boost"] = boost

        elite.sort(key=lambda l: (-l.scores["fair"], l.last_offered_at))
        now = time.time()
        result = elite[:top_n]
        for lw in result:
            AUDIT.info("recommend_v2.4", extra={"case": case.id, "lawyer": lw.id,
                                                "fair": lw.scores["fair"],
                                                "divBoost": lw.scores["diversity_boost"],
                                                "success_status": lw.kpi.success_status})
            lw.last_offered_at = now
        return result

# --------------------------------------------------------------------------- #
# 7. Exemplo de uso CLI (para QA)
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    def make_adv(idx:int, gender:str="M", status="V") -> Lawyer:
        return Lawyer(
            id=f"adv_{idx}",
            nome=f"Dr. {idx}",
            tags_expertise=["Trabalhista"],
            geo_latlon=(-23.55, -46.63),
            curriculo_json={"anos_experiencia":15, "num_publicacoes":3},
            kpi=KPI(success_rate=0.9, cases_30d=10, capacidade_mensal=30,
                    avaliacao_media=4.5, tempo_resposta_h=12, success_status=status),
            diversity=DiversityMeta(gender=gender),
            review_texts=["Excelente profissional"*10],
            casos_historicos_embeddings=[np.random.rand(EMBEDDING_DIM) for _ in range(3)],
            case_outcomes=[True, True, False]
        )
    case = Case(id="c1", area="Trabalhista", subarea="Rescisão",
                urgency_h=48, coords=(-23.55,-46.63), complexity="HIGH",
                summary_embedding=np.random.rand(EMBEDDING_DIM))
    advs = [make_adv(1,"F","V"), make_adv(2,"M","P"), make_adv(3,"M","N")]
    eng = MatchEngine()
    ranked = asyncio.run(eng.rank(case, advs, preset="expert"))
    for pos, a in enumerate(ranked,1):
        print(pos, a.id, a.scores['fair'])
