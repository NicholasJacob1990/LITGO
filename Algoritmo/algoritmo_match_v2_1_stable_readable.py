# -*- coding: utf-8 -*-
"""algoritmo_match_v2_1_stable_readable.py
Algoritmo de Match Jurídico Inteligente — v2.1‑stable (versão legível)
======================================================================
Ajustes desta revisão ✨
----------------------
1. **Bug‑fix**: `equity_weight` agora usa `kpi.capacidade_mensal` (corrige typo).
2. **Feature Q aprimorada**: pontua **pós‑graduação lato sensu, mestrado e
   doutorado** separadamente (máx. 2 títulos por nível) — mais justa e granular.
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from math import asin, cos, log1p, radians, sin, sqrt
from typing import Any, Dict, List, Tuple
from pathlib import Path
import os

import numpy as np

# =============================================================================
# 1. Configurações globais
# =============================================================================

# --- Pesos ---
# Caminho para os pesos dinâmicos do LTR, configurável via variável de ambiente
default_path = Path(__file__).parent.parent / "backend/models/ltr_weights.json"
WEIGHTS_FILE = Path(os.getenv("LTR_WEIGHTS_PATH", default_path))

# Pesos padrão (fallback)
DEFAULT_WEIGHTS = {
    "A": 0.30, "S": 0.25, "T": 0.15, "G": 0.10,
    "Q": 0.10, "U": 0.05, "R": 0.05,
}
# Variável global para armazenar os pesos carregados
_current_weights = {}

def load_weights() -> Dict[str, float]:
    """Carrega os pesos do LTR do arquivo JSON, com fallback para os padrões."""
    global _current_weights
    try:
        if WEIGHTS_FILE.exists():
            with open(WEIGHTS_FILE, 'r') as f:
                loaded = json.load(f)
                # Validação simples para garantir que os pesos não estão todos zerados
                if any(v > 0 for v in loaded.values()):
                    logging.info(f"Pesos do LTR carregados de '{WEIGHTS_FILE}'")
                    _current_weights = loaded
                else:
                    raise ValueError("Pesos do LTR no arquivo são todos zero, usando fallback.")
        else:
            raise FileNotFoundError("Arquivo de pesos não encontrado.")
    except (FileNotFoundError, ValueError, json.JSONDecodeError) as e:
        logging.warning(f"Não foi possível carregar pesos do LTR ({e}). Usando pesos padrão.")
        _current_weights = DEFAULT_WEIGHTS
    return _current_weights

# Carregamento inicial na inicialização do módulo
load_weights()

# --- Outras Configs ---
EMBEDDING_DIM = 384              # Dimensão dos vetores pgvector
RAIO_GEOGRAFICO_KM = 50          # Normalização para G
MIN_EPSILON = 0.05               # Limite inferior ε‑cluster
BETA_EQUITY = 0.30               # Peso equidade
OVERLOAD_FLOOR = 0.05            # Piso quando lotado

# =============================================================================
# 2. Logging em JSON
# =============================================================================

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:  # noqa: D401
        return json.dumps({
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "context": record.args,
        })

_handler = logging.StreamHandler()
_handler.setFormatter(JsonFormatter())
AUDIT_LOGGER = logging.getLogger("audit.match")
AUDIT_LOGGER.addHandler(_handler)
AUDIT_LOGGER.setLevel(logging.INFO)

# =============================================================================
# 3. Utilitários
# =============================================================================

def haversine(coord_a: Tuple[float, float], coord_b: Tuple[float, float]) -> float:
    """Distância Haversine em km."""
    lat1, lon1, lat2, lon2 = map(radians, (*coord_a, *coord_b))
    dlat, dlon = lat2 - lat1, lon2 - lon1
    hav = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * 6371 * asin(sqrt(hav))


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    denom = float(np.linalg.norm(vec_a) * np.linalg.norm(vec_b)) or 1e-9
    return float(np.dot(vec_a, vec_b) / denom)

# =============================================================================
# 4. Dataclasses
# =============================================================================

@dataclass(slots=True)
class Case:
    id: str
    area: str
    subarea: str
    urgency_h: int
    coords: Tuple[float, float]
    summary_embedding: np.ndarray = field(
        default_factory=lambda: np.zeros(EMBEDDING_DIM, dtype=np.float32)
    )


@dataclass(slots=True)
class KPI:
    success_rate: float
    cases_30d: int
    capacidade_mensal: int
    avaliacao_media: float
    tempo_resposta_h: int


@dataclass(slots=True)
class Lawyer:
    id: str
    nome: str
    tags_expertise: List[str]
    geo_latlon: Tuple[float, float]
    curriculo_json: Dict[str, Any]
    kpi: KPI
    last_offered_at: float = field(default_factory=time.time)
    casos_historicos_embeddings: List[np.ndarray] = field(default_factory=list)
    scores: Dict[str, Any] = field(default_factory=dict)

# =============================================================================
# 5. Feature calculator
# =============================================================================

class FeatureCalculator:
    """Calcula as sete features normalizadas (0‑1)."""

    def __init__(self, case: Case, lawyer: Lawyer) -> None:
        self.case = case
        self.lawyer = lawyer
        self.cv = lawyer.curriculo_json

    # --------‑‑‑‑‑ Features individuais ‑‑‑‑‑---------

    def area_match(self) -> float:
        return 1.0 if self.case.area in self.lawyer.tags_expertise else 0.0

    def case_similarity(self) -> float:
        embeds = self.lawyer.casos_historicos_embeddings
        if not embeds:
            return 0.0
        return float(np.mean([cosine_similarity(self.case.summary_embedding, e) for e in embeds]))

    def success_rate(self) -> float:
        return np.clip(self.lawyer.kpi.success_rate, 0, 1)

    def geo_score(self) -> float:
        dist = haversine(self.case.coords, self.lawyer.geo_latlon)
        return np.clip(1 - dist / RAIO_GEOGRAFICO_KM, 0, 1)

    def qualification_score(self) -> float:
        """Pontua experiência + títulos (lato sensu/mestrado/doutorado) + publicações."""
        # Experiência (0‑1)
        score_exp = min(1.0, self.cv.get("anos_experiencia", 0) / 25)

        # Estrutura esperada: list[dict{"nivel": "lato|mestrado|doutorado", "area": "..."}]
        titles: List[Dict[str, str]] = self.cv.get("pos_graduacoes", [])
        counts = {"lato": 0, "mestrado": 0, "doutorado": 0}
        for t in titles:
            level = str(t.get("nivel", "")).lower()
            area_match = self.case.area.lower() in str(t.get("area", "")).lower()
            if level in counts and area_match:
                counts[level] += 1
        # Máx 2 títulos por nível
        score_lato = min(counts["lato"], 2) / 2
        score_mest = min(counts["mestrado"], 2) / 2
        score_doc  = min(counts["doutorado"], 2) / 2

        # Pesos internos: lato 0.1, mestrado 0.2, doutorado 0.3 (até 0.6 total)
        score_titles = 0.1 * score_lato + 0.2 * score_mest + 0.3 * score_doc

        pubs = self.cv.get("num_publicacoes", 0)
        score_pub = min(1.0, log1p(pubs) / log1p(10))

        return 0.4 * score_exp + 0.4 * score_titles + 0.2 * score_pub

    def urgency_capacity(self) -> float:
        if self.case.urgency_h <= 0:
            return 0.0
        return np.clip(1 - self.lawyer.kpi.tempo_resposta_h / self.case.urgency_h, 0, 1)

    def review_score(self) -> float:
        return np.clip(self.lawyer.kpi.avaliacao_media / 5, 0, 1)

    # --------‑‑‑‑‑ Aggregate ‑‑‑‑‑---------

    def all(self) -> Dict[str, float]:  # noqa: D401
        return {
            "A": self.area_match(),
            "S": self.case_similarity(),
            "T": self.success_rate(),
            "G": self.geo_score(),
            "Q": self.qualification_score(),
            "U": self.urgency_capacity(),
            "R": self.review_score(),
        }

# =============================================================================
# 6. Core algorithm
# =============================================================================

class MatchmakingAlgorithm:
    """Gera ranking justo de advogados para um caso."""

    @staticmethod
    def equity_weight(kpi: KPI) -> float:
        if kpi.capacidade_mensal > kpi.cases_30d:
            return 1 - kpi.cases_30d / kpi.capacidade_mensal  # ✓ typo corrigido
        return OVERLOAD_FLOOR

    # ------------------------------------------------------------------
    def rank(self, case: Case, lawyers: List[Lawyer], top_n: int = 5) -> List[Lawyer]:
        if not lawyers:
            return []

        # 1. Calcular raw score
        for lw in lawyers:
            feats = FeatureCalculator(case, lw).all()
            lw.scores = {
                "features": feats,
                "raw": sum(_current_weights[k] * feats[k] for k in _current_weights),
            }

        best_raw = max(lw.scores["raw"] for lw in lawyers)
        eps = max(MIN_EPSILON, best_raw * 0.10)
        elite = [lw for lw in lawyers if lw.scores["raw"] >= best_raw - eps]

        # 2. Aplicar equidade + desempate RR
        for lw in elite:
            eq = self.equity_weight(lw.kpi)
            lw.scores["equity"] = eq
            lw.scores["fair"] = (1 - BETA_EQUITY) * lw.scores["raw"] + BETA_EQUITY * eq
        elite.sort(key=lambda l: (-l.scores["fair"], l.last_offered_at))

        # 3. Persistir timestamp e auditar
        now = time.time()
        top = elite[:top_n]
        for lw in top:
            AUDIT_LOGGER.info("recommend", extra={"case": case.id, "lawyer": lw.id, "fair": lw.scores["fair"]})
            lw.last_offered_at = now  # TODO: persistir em DB
        return top

# =============================================================================
# 7. Demonstração
# =============================================================================

if __name__ == "__main__":
    """Bloco de auto‑teste rápido.

    Cria três advogados com diferentes combinações de títulos e carga,
    executa o algoritmo e imprime os placares detalhados.
    """

    np.random.seed(42)

    # Caso trabalhista fictício
    case_demo = Case(
        id="c‑demo‑42",
        area="Trabalhista",
        subarea="Justa Causa",
        urgency_h=48,
        coords=(-23.55, -46.63),
        summary_embedding=np.random.rand(EMBEDDING_DIM),
    )

    def make_lawyer(idx: int, exp: int, succ: float, load: int, titles: List[Dict[str, str]]):
        """Helper para gerar advogado sintético."""
        return Lawyer(
            id=f"lw‑{idx}",
            nome=f"Advogado {idx}",
            tags_expertise=["Trabalhista"],
            geo_latlon=(-23.5 + 0.02 * idx, -46.6 + 0.02 * idx),
            curriculo_json={
                "anos_experiencia": exp,
                "pos_graduacoes": titles,
                "num_publicacoes": idx,  # apenas para variar
            },
            kpi=KPI(
                success_rate=succ,
                cases_30d=load,
                capacidade_mensal=20,
                avaliacao_media=4.6,
                tempo_resposta_h=12,
            ),
            casos_historicos_embeddings=[np.random.rand(EMBEDDING_DIM) for _ in range(3)],
            last_offered_at=time.time() - idx * 86_400,  # cada dia atrás
        )

    lawyers_demo = [
        make_lawyer(
            1,
            exp=15,
            succ=0.95,
            load=18,
            titles=[{"nivel": "lato", "area": "Trabalhista"}, {"nivel": "mestrado", "area": "Trabalhista"}],
        ),
        make_lawyer(
            2,
            exp=14,
            succ=0.94,
            load=10,
            titles=[{"nivel": "mestrado", "area": "Civil"}],
        ),
        make_lawyer(
            3,
            exp=14,
            succ=0.94,
            load=10,
            titles=[{"nivel": "doutorado", "area": "Trabalhista"}],
        ),
    ]

    matcher = MatchmakingAlgorithm()
    ranking = matcher.rank(case_demo, lawyers_demo, top_n=3)

    print("—— Resultado do Ranking ——")
    for pos, adv in enumerate(ranking, 1):
        feats = adv.scores["features"]
        print(
            f"{pos}º {adv.nome} | raw={adv.scores['raw']:.3f} | fair={adv.scores['fair']:.3f} | "
            f"A={feats['A']:.2f} S={feats['S']:.2f} Q={feats['Q']:.2f} eq={adv.scores['equity']:.2f}"
        )

    print("\nObservações:")
    print("• 'Q' reflete quantidade e nível de títulos relevantes (até 2 lato, 2 mestrado, 2 doutorado).")
    print("• Desempate entre advogados com mesmo 'fair' é feito pelo timestamp 'last_offered_at'.")

