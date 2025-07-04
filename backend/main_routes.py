# backend/routes.py
from fastapi import APIRouter, HTTPException, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from backend.models import (
    TriageRequest,
    MatchRequest, MatchResponse,
    ExplainRequest, ExplainResponse
)
from backend.services import generate_explanations_for_matches
from backend.auth import get_current_user
from backend.tasks import run_triage_async_task # Importa a tarefa Celery
from pydantic import BaseModel
from celery.result import AsyncResult
from backend.celery_app import celery_app
from backend.services.match_service import find_and_notify_matches
from backend.algoritmo_match import load_weights as reload_algorithm_weights # Importa a função de recarregamento

# Configuração do rate limiter para as rotas
limiter = Limiter(key_func=get_remote_address)

class TriageTaskResponse(BaseModel):
    task_id: str
    status: str
    message: str

router = APIRouter()

@router.get("/triage/status/{task_id}")
async def get_triage_status(task_id: str, user: dict = Depends(get_current_user)):
    """
    Verifica o status de uma tarefa de triagem assíncrona.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.ready():
        if task_result.successful():
            return {"status": "completed", "result": task_result.get()}
        else:
            return {"status": "failed", "error": str(task_result.info)}
    
    return {"status": "pending"}

@router.post("/triage", response_model=TriageTaskResponse, status_code=202)
@limiter.limit("60/minute")
async def http_triage_case(request: Request, payload: TriageRequest, user: dict = Depends(get_current_user)):
    """
    Endpoint para a triagem de um novo caso.
    Despacha uma tarefa assíncrona para processamento e retorna um ID de tarefa.
    """
    try:
        # Envia a tarefa para a fila do Celery
        task = run_triage_async_task.delay(payload.texto_cliente, payload.coords)
        return TriageTaskResponse(
            task_id=task.id,
            status="accepted",
            message="A triagem do seu caso foi iniciada. Você será notificado quando estiver concluída."
        )
    except Exception as e:
        # Erro ao despachar a tarefa (ex: Redis indisponível)
        raise HTTPException(status_code=500, detail=f"Erro ao iniciar a triagem: {e}")

@router.post("/match", response_model=MatchResponse)
async def http_find_matches(req: MatchRequest, user: dict = Depends(get_current_user)):
    """
    Endpoint para encontrar advogados para um caso.
    Recebe o ID de um caso, retorna uma lista ordenada de advogados e
    dispara notificações para os advogados encontrados.
    """
    result = await find_and_notify_matches(req)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Caso com ID '{req.case_id}' não encontrado.")
    
    return result

@router.post("/explain", response_model=ExplainResponse)
@limiter.limit("30/minute")
async def http_explain_matches(request: Request, req: ExplainRequest, user: dict = Depends(get_current_user)):
    try:
        explanations = await generate_explanations_for_matches(req.case_id, req.lawyer_ids)
        return ExplainResponse(explanations=explanations)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar explicações: {e}")

# === Endpoints Internos ===

@router.post("/internal/reload_weights", status_code=200)
async def http_reload_weights():
    """
    Endpoint interno para recarregar os pesos do algoritmo de match a partir do arquivo.
    Isso permite atualizar o modelo de LTR sem reiniciar a aplicação.
    """
    try:
        new_weights = reload_algorithm_weights()
        return {"status": "success", "message": "Pesos do algoritmo recarregados.", "new_weights": new_weights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao recarregar os pesos: {e}") 