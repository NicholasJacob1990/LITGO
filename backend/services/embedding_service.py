# backend/services/embedding_service.py
import os
import logging
from openai import AsyncOpenAI
from tenacity import retry, wait_random_exponential, stop_after_attempt
import numpy as np  # Novo import para normalização L2

# Configuração do logger
logger = logging.getLogger(__name__)

# --- Configuração do Cliente OpenAI ---
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.warning("OPENAI_API_KEY não encontrada. O serviço de embedding não funcionará.")

client = AsyncOpenAI(api_key=api_key)
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 384  # Dimensão consistente com o algoritmo de match

@retry(
    wait=wait_random_exponential(min=1, max=20),
    stop=stop_after_attempt(6),
    retry_error_callback=lambda retry_state: logger.error(
        "Falha ao gerar embedding após %s tentativas: %s",
        retry_state.attempt_number,
        retry_state.outcome.exception() if retry_state.outcome else "Desconhecido"
    )
)
async def generate_embedding(text: str) -> list[float] | None:
    """
    Gera um vetor de embedding para um texto usando a API da OpenAI.
    A função usa um mecanismo de retry com backoff exponencial.

    Args:
        text: O texto a ser processado.

    Returns:
        Uma lista de floats representando o vetor de embedding, ou None se falhar.
    """
    if not client.api_key:
        logger.error("API Key da OpenAI não está disponível.")
        return None

    try:
        # Limpa o texto para evitar problemas com a API
        cleaned_text = text.replace("\n", " ")

        response = await client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=[cleaned_text],  # A API espera uma lista de textos
            dimensions=EMBEDDING_DIM
        )

        if response.data and len(response.data) > 0:
            raw_vector = response.data[0].embedding

            # --- Normalização L2 -------------------------------------------------
            vec = np.asarray(raw_vector, dtype=np.float32)
            norm = np.linalg.norm(vec)
            if norm:  # Evita divisão por zero
                vec = vec / norm

            return vec.tolist()
        else:
            logger.error("Resposta da API de embedding inválida: %s", response)
            return None

    except Exception as e:
        logger.exception("Erro inesperado ao gerar embedding para o texto: '%s...'", text[:50])
        # A exceção será relançada pelo `tenacity` para acionar a retentativa
        raise
