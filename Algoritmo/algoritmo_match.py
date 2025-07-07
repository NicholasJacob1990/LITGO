# -*- coding: utf-8 -*-
"""algoritmo_match_v2_2_expanded.py
Algoritmo de Match Jurídico Inteligente — v2.2‑expanded
======================================================================
Expansões v2.2 ✨
-----------------
1. **Feature C**: Soft-skills baseada em análise de sentimento de reviews
2. **KPI granular**: Success rate específico por área/subárea
3. **Case similarity ponderada**: Considera outcomes históricos
4. **Pesos dinâmicos**: Ajuste baseado em complexidade do caso
5. **Cache estático**: Para features Q/T/G que mudam pouco
6. **Breakdown detalhado**: Delta por feature para explicabilidade
7. **Preset helper**: Configurações rápidas (fast/expert)
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from math import asin, cos, log1p, radians, sin, sqrt
from typing import Any, Dict, List, Tuple, Optional
from pathlib import Path
import os
import atexit
import asyncio

# Adicionar comentários para suprimir erros de linter se necessário
# type: ignore - para ignorar erros de importação não resolvidos
import numpy as np  # type: ignore
import redis.asyncio as aioredis  # type: ignore

# =============================================================================
# 1. Configurações globais
# =============================================================================

# --- Pesos ---
# Caminho para os pesos dinâmicos do LTR, configurável via variável de ambiente
default_path = Path(__file__).parent / "models/ltr_weights.json"
WEIGHTS_FILE = Path(os.getenv("LTR_WEIGHTS_PATH", default_path))

# Pesos padrão (fallback) - agora incluem feature C
DEFAULT_WEIGHTS = {
    "A": 0.30, "S": 0.25, "T": 0.15, "G": 0.10,
    "Q": 0.10, "U": 0.05, "R": 0.05, "C": 0.03  # Nova feature C
}

# Presets para diferentes cenários
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

# Variável global para armazenar os pesos carregados
_current_weights = {}

# URL Redis reutilizada do ambiente (mesma usada no Celery)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

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

def load_preset(preset: str) -> Dict[str, float]:
    """Carrega preset de pesos específico."""
    return PRESET_WEIGHTS.get(preset, DEFAULT_WEIGHTS)

# Carregamento inicial na inicialização do módulo
load_weights()

# --- Outras Configs ---
EMBEDDING_DIM = 384              # Dimensão dos vetores pgvector
RAIO_GEOGRAFICO_KM = 50          # Normalização para G
MIN_EPSILON = 0.05               # Limite inferior ε‑cluster
BETA_EQUITY = 0.30               # Peso equidade
DIVERSITY_TAU = 0.30             # 30 % de representatividade mínima (v2.3)
DIVERSITY_LAMBDA = 0.05          # boost extra (v2.3)
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
# 4. Dataclasses expandidas
# =============================================================================

@dataclass(slots=True)
class DiversityMeta: # (v2.3)
    gender: Optional[str] = None   # 'F', 'M', 'NB' …
    ethnicity: Optional[str] = None
    pcd: Optional[bool] = None
    consent_ts: Optional[float] = None

@dataclass(slots=True)
class Case:
    id: str
    area: str
    subarea: str
    urgency_h: int
    coords: Tuple[float, float]
    complexity: str = "MEDIUM"  # Nova v2.2: LOW, MEDIUM, HIGH
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
    cv_score: float = 0.0  # Nova v2.2: score do CV
    success_status: str = "N"  # 'V','P','N' (v2.3)


@dataclass(slots=True)
class Lawyer:
    id: str
    nome: str
    tags_expertise: List[str]
    geo_latlon: Tuple[float, float]
    curriculo_json: Dict[str, Any]
    kpi: KPI
    diversity: Optional[DiversityMeta] = None # (v2.3)
    kpi_subarea: Dict[str, float] = field(default_factory=dict)  # Nova v2.2: KPI granular
    kpi_softskill: float = 0.0  # Nova v2.2: soft-skills score
    case_outcomes: List[bool] = field(default_factory=list)  # Nova v2.2: histórico de outcomes
    last_offered_at: float = field(default_factory=time.time)
    casos_historicos_embeddings: List[np.ndarray] = field(default_factory=list)
    scores: Dict[str, Any] = field(default_factory=dict)

# =============================================================================
# 5. Cache estático (simulado)
# =============================================================================

class RedisCache:
    """Cache baseado em Redis assíncrono para features quase estáticas."""

    def __init__(self, redis_url: str):
        self._redis = aioredis.from_url(redis_url, socket_timeout=1, decode_responses=True)
        self._prefix = 'match:cache'

    async def get_static_feats(self, lawyer_id: str) -> Optional[Dict[str, float]]:
        raw = await self._redis.get(f"{self._prefix}:{lawyer_id}")
        if raw:
            import json
            return json.loads(raw)
        return None

    async def set_static_feats(self, lawyer_id: str, features: Dict[str, float]):
        import json
        # TTL de 24h (features mudam pouco)
        await self._redis.set(f"{self._prefix}:{lawyer_id}", json.dumps(features), ex=86400)

    async def close(self) -> None:
        """Fecha a conexão com o Redis."""
        await self._redis.close()

# Substitui cache fake
cache = RedisCache(REDIS_URL)

# =============================================================================
# 6. Feature calculator expandido
# =============================================================================

class FeatureCalculator:
    """Calcula as oito features normalizadas (0‑1) incluindo soft-skills."""

    def __init__(self, case: Case, lawyer: Lawyer) -> None:
        self.case = case
        self.lawyer = lawyer
        self.cv = lawyer.curriculo_json

    # --------‑‑‑‑‑ Features individuais ‑‑‑‑‑---------

    def area_match(self) -> float:
        return 1.0 if self.case.area in self.lawyer.tags_expertise else 0.0

    def case_similarity(self) -> float:
        """Case similarity ponderada por outcomes históricos."""
        embeds = self.lawyer.casos_historicos_embeddings
        if not embeds:
            return 0.0
        
        # Calcular similaridades
        sims = [cosine_similarity(self.case.summary_embedding, e) for e in embeds]
        
        # Pesos baseados em outcomes (vitórias têm peso maior)
        outcomes = self.lawyer.case_outcomes
        if outcomes and len(outcomes) == len(sims):
            weights = [1.0 if outcome else 0.8 for outcome in outcomes]
            return float(np.average(sims, weights=weights))
        else:
            return float(np.mean(sims))

    def success_rate(self) -> float:
        """Success rate com smoothing bayesiano e multiplicador de status (v2.3)."""
        # (v2.3) multiplicador M conforme status
        mult = {"V": 1.0, "P": 0.4, "N": 0.0}.get(self.lawyer.kpi.success_status, 0.0)

        key = f"{self.case.area}/{self.case.subarea}"
        granular = self.lawyer.kpi_subarea.get(key)
        total_cases = self.lawyer.kpi.cases_30d or 1  # fallback 1 para evitar div/0
        # Parâmetros de smoothing
        alpha, beta = 1, 1  # prior (Beta(1,1))
        if granular is not None:
            # Supõe-se granular como valor float (sucessos/total). Estimamos wins.
            wins = int(granular * total_cases)
            base = (wins + alpha) / (total_cases + alpha + beta)
        else:
            # Fallback para taxa geral com smoothing
            wins_general = int(self.lawyer.kpi.success_rate * total_cases)
            base = (wins_general + alpha) / (total_cases + alpha + beta)
        
        return np.clip(base * mult, 0, 1)

    def geo_score(self) -> float:
        dist = haversine(self.case.coords, self.lawyer.geo_latlon)
        return np.clip(1 - dist / RAIO_GEOGRAFICO_KM, 0, 1)

    def qualification_score(self) -> float:
        """Qualificação aprimorada com CV score."""
        # Score original baseado em experiência e títulos
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

        # Score tradicional
        base_score = 0.4 * score_exp + 0.4 * score_titles + 0.2 * score_pub
        
        # Integração com CV score v2.2
        cv_score = self.lawyer.kpi.cv_score
        return 0.8 * base_score + 0.2 * cv_score

    def urgency_capacity(self) -> float:
        if self.case.urgency_h <= 0:
            return 0.0
        return np.clip(1 - self.lawyer.kpi.tempo_resposta_h / self.case.urgency_h, 0, 1)

    def review_score(self) -> float:
        return np.clip(self.lawyer.kpi.avaliacao_media / 5, 0, 1)

    def soft_skill(self) -> float:
        """Nova feature C: soft-skills baseada em análise de sentimento."""
        return np.clip(self.lawyer.kpi_softskill, 0, 1)

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
            "C": self.soft_skill(),  # Nova feature v2.2
        }

# =============================================================================
# 7. Core algorithm expandido
# =============================================================================

class MatchmakingAlgorithm:
    """Gera ranking justo de advogados para um caso com features v2.2."""

    @staticmethod
    def equity_weight(kpi: KPI) -> float:
        if kpi.capacidade_mensal > kpi.cases_30d:
            return 1 - kpi.cases_30d / kpi.capacidade_mensal
        return OVERLOAD_FLOOR

    @staticmethod
    def apply_dynamic_weights(case: Case, base_weights: Dict[str, float]) -> Dict[str, float]:
        """Aplica pesos dinâmicos baseados na complexidade do caso e normaliza."""
        weights = base_weights.copy()
        
        if case.complexity == "HIGH":
            # Casos complexos valorizam mais qualificação e taxa de sucesso
            weights["Q"] += 0.05
            weights["T"] += 0.05
            weights["U"] -= 0.05
            weights["C"] += 0.02  # Soft-skills mais importantes
        elif case.complexity == "LOW":
            # Casos simples valorizam mais urgência e localização
            weights["U"] += 0.05
            weights["G"] += 0.03
            weights["Q"] -= 0.05
            weights["T"] -= 0.03
        
        # Garantir pesos não negativos
        for k, v in weights.items():
            if v < 0:
                weights[k] = 0.0
        # Normalizar soma=1
        total = sum(weights.values()) or 1
        return {k: v/total for k, v in weights.items()}

    # -------- Diversity helper (v2.3) --------
    @staticmethod
    def _group_key(lawyer: Lawyer) -> str:
        """Define a chave de grupo para diversidade (gênero como proxy)."""
        if lawyer.diversity and lawyer.diversity.gender:
            return lawyer.diversity.gender
        return "UNK"

    @staticmethod
    def _diversity_boost(rep: float) -> float:
        """Calcula o boost se a representatividade for menor que o limiar TAU."""
        return DIVERSITY_LAMBDA if rep < DIVERSITY_TAU else 0.0

    # ------------------------------------------------------------------
    async def rank(self, case: Case, lawyers: List[Lawyer], top_n: int = 5, 
                   preset: str = "balanced") -> List[Lawyer]:
        """Classifica advogados para um caso.

        Passos:
        1. Carrega pesos (preset + dinâmica).
        2. Calcula features (cache Redis para estáticas).
        3. Gera breakdown `delta` por feature.
        4. Aplica ε-cluster e equidade, incluindo boost de diversidade (v2.3).
        5. Retorna top_n ordenados por `fair` e `last_offered_at`.
        """
        if not lawyers:
            return []

        # 1. Carregar pesos base combinando LTR + preset
        base_weights = (_current_weights or DEFAULT_WEIGHTS).copy()
        # Sobrepor apenas chaves declaradas no preset (permite ajustes rápidos)
        base_weights.update(load_preset(preset))
        
        # 2. Aplicar pesos dinâmicos baseados na complexidade
        weights = self.apply_dynamic_weights(case, base_weights)

        # 3. Calcular features com cache
        for lw in lawyers:
            # Tentar recuperar features estáticas do cache
            static_feats = await cache.get_static_feats(lw.id)
            
            if static_feats:
                # Usar features do cache
                feats = static_feats.copy()
                # Calcular apenas features dinâmicas
                calculator = FeatureCalculator(case, lw)
                feats["A"] = calculator.area_match()
                feats["S"] = calculator.case_similarity()
                feats["U"] = calculator.urgency_capacity()
                feats["C"] = calculator.soft_skill()
            else:
                # Calcular todas as features
                calculator = FeatureCalculator(case, lw)
                feats = calculator.all()
                
                # Armazenar features estáticas no cache
                static_features = {
                    "T": feats["T"],
                    "G": feats["G"],
                    "Q": feats["Q"],
                    "R": feats["R"]
                }
                await cache.set_static_feats(lw.id, static_features)

            # 4. Calcular breakdown detalhado (delta) – defensivo quanto a chaves ausentes
            delta = {k: weights.get(k, 0) * feats.get(k, 0) for k in DEFAULT_WEIGHTS}
            raw_score = sum(delta.values())
            
            # 5. Armazenar scores expandidos
            lw.scores = {
                "features": feats,
                "delta": delta,
                "raw": raw_score,
                "weights_used": weights,
                "preset": preset,
                "complexity": case.complexity
            }

        # 6. Aplicar equidade + desempate RR
        best_raw = max((lw.scores["raw"] for lw in lawyers), default=0)
        eps = max(MIN_EPSILON, best_raw * 0.10)
        elite = [lw for lw in lawyers if lw.scores["raw"] >= best_raw - eps]

        if not elite:
             return []

        for lw in elite:
            eq = self.equity_weight(lw.kpi)
            lw.scores["equity"] = eq
            # Score de equidade baseado em carga de trabalho (ainda não inclui boost de diversidade)
            lw.scores["fair_pre_diversity"] = (1 - BETA_EQUITY) * lw.scores["raw"] + BETA_EQUITY * eq
        
        # (v2.3) Lógica de diversidade
        # Contar representatividade de cada grupo no conjunto de elite
        groups: Dict[str, int] = {}
        for lw in elite:
            key = self._group_key(lw)
            groups[key] = groups.get(key, 0) + 1
        
        total_elite = len(elite)
        representation = {k: v / total_elite for k, v in groups.items()}

        # Aplicar boost de diversidade
        for lw in elite:
            group_key = self._group_key(lw)
            rep = representation.get(group_key, 1.0) # Default 1.0 para não dar boost em grupo não encontrado
            boost = self._diversity_boost(rep)
            lw.scores["diversity_boost"] = boost
            # O boost é somado ao score de equidade
            lw.scores["fair"] = lw.scores["fair_pre_diversity"] + boost
        
        elite.sort(key=lambda l: (-l.scores.get("fair", 0), l.last_offered_at))

        # 7. Persistir timestamp e auditar
        now = time.time()
        top = elite[:top_n]
        for lw in top:
            # (v2.3) Log de auditoria estendido
            AUDIT_LOGGER.info("recommend_v2.3", extra={
                "case": case.id, 
                "lawyer": lw.id, 
                "fair": lw.scores.get("fair", 0),
                "features": lw.scores["features"],
                "delta": lw.scores["delta"],
                "preset": preset,
                "complexity": case.complexity,
                "success_status": lw.kpi.success_status, # v2.3
                "diversity_boost": lw.scores.get("diversity_boost", 0) # v2.3
            })
            lw.last_offered_at = now

        return top

# =============================================================================
# 8. Exemplo de uso expandido
# =============================================================================

if __name__ == "__main__":
    # Exemplo com as novas features v2.2
    
    def make_lawyer_v2(id_num: int, exp: int, succ: float, load: int, 
                       titles: List[Dict], soft_skill: float = 0.5,
                       kpi_subarea: Optional[Dict[str, float]] = None,
                       case_outcomes: Optional[List[bool]] = None,
                       success_status: str = "N", # (v2.3)
                       diversity: Optional[DiversityMeta] = None # (v2.3)
                       ) -> Lawyer:
        return Lawyer(
            id=f"adv_{id_num}",
            nome=f"Dr. Exemplo {id_num}",
            tags_expertise=["Trabalhista"],
            geo_latlon=(-23.5505, -46.6333),
            curriculo_json={
                "anos_experiencia": exp,
                "pos_graduacoes": titles,
                "num_publicacoes": exp // 3,
            },
            kpi=KPI(
                success_rate=succ,
                cases_30d=load,
                capacidade_mensal=25,
                avaliacao_media=4.2,
                tempo_resposta_h=12,
                cv_score=min(1.0, exp / 20),
                success_status=success_status # (v2.3)
            ),
            diversity=diversity, # (v2.3)
            kpi_subarea=kpi_subarea or {"Trabalhista/Rescisão": succ + 0.1},
            kpi_softskill=soft_skill,
            case_outcomes=case_outcomes or [True, True, False, True],
            casos_historicos_embeddings=[np.random.rand(EMBEDDING_DIM) for _ in range(3)],
        )

    # Caso de teste com complexidade
    case_demo = Case(
        id="caso_v2_demo",
        area="Trabalhista",
        subarea="Rescisão",
        urgency_h=48,
        coords=(-23.5505, -46.6333),
        complexity="HIGH",  # Caso complexo
        summary_embedding=np.random.rand(EMBEDDING_DIM),
    )

    # Advogados de teste com features v2.2
    lawyers_demo = [
        make_lawyer_v2(1, exp=15, succ=0.95, load=18, 
                       titles=[{"nivel": "mestrado", "area": "Trabalhista"}],
                       soft_skill=0.8, case_outcomes=[True, True, True, False],
                       success_status="V", diversity=DiversityMeta(gender="F")),
        make_lawyer_v2(2, exp=12, succ=0.88, load=10,
                       titles=[{"nivel": "lato", "area": "Trabalhista"}],
                       soft_skill=0.6, case_outcomes=[True, False, True, True],
                       success_status="P", diversity=DiversityMeta(gender="M")),
        make_lawyer_v2(3, exp=20, succ=0.92, load=15,
                       titles=[{"nivel": "doutorado", "area": "Trabalhista"}],
                       soft_skill=0.9, case_outcomes=[True, True, True, True],
                       success_status="V", diversity=DiversityMeta(gender="M")),
    ]

    async def demo_v2():
        matcher = MatchmakingAlgorithm()
        
        # Teste com preset "expert" para caso complexo
        ranking = await matcher.rank(case_demo, lawyers_demo, top_n=3, preset="expert")

        print("—— Resultado do Ranking v2.3 ——")
        for pos, adv in enumerate(ranking, 1):
            scores = adv.scores
            feats = scores["features"]
            delta = scores["delta"]
            
            print(f"{pos}º {adv.nome}")
            print(f"  Fair: {scores['fair']:.3f} | Raw: {scores['raw']:.3f} | DivBoost: {scores.get('diversity_boost', 0):.3f}")
            print(f"  Features: A={feats['A']:.2f} S={feats['S']:.2f} T={feats['T']:.2f} G={feats['G']:.2f}")
            print(f"           Q={feats['Q']:.2f} U={feats['U']:.2f} R={feats['R']:.2f} C={feats['C']:.2f}")
            print(f"  Delta: {delta}")
            print(f"  Preset: {scores['preset']} | Complexity: {scores['complexity']}")
            print()

    import asyncio
    asyncio.run(demo_v2())

    print("\nObservações v2.3:")
    print("• Feature 'T' (sucesso) agora é modulada por status de verificação (V/P/N).")
    print("• Lógica de diversidade (β-layer) aplicada para aumentar representatividade.")
    print("• Log de auditoria estendido com `success_status` e `diversity_boost`.")

@atexit.register
def _close_redis():
    try:
        loop = asyncio.get_event_loop()
        if not loop.is_closed():
            loop.run_until_complete(cache.close())
    except RuntimeError:
        pass
