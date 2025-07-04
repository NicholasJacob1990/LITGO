# backend/tasks.py
import os
import uuid
import asyncio
from .celery_app import celery_app
from .triage_service import triage_service
from .embedding_service import generate_embedding
from supabase import create_client, Client

# --- Configuração do Cliente Supabase para o Worker ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def get_supabase_client() -> Client:
    """Cria um novo cliente Supabase para garantir que cada tarefa tenha sua própria instância."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("Variáveis de ambiente do Supabase não configuradas para o worker Celery.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def _process_triage_flow(texto_cliente: str, coords: tuple = None) -> dict:
    """
    Lógica de negócio para a triagem, compartilhada entre a execução síncrona e a assíncrona.
    """
    supabase = get_supabase_client()
    
    # 1. Executa a triagem com LLM
    triage_result = await triage_service.run_triage(texto_cliente)
    summary = triage_result["summary"]
    
    # 2. Gera o embedding
    embedding = await generate_embedding(summary)
    
    # 3. Salva o caso no banco de dados
    case_id = str(uuid.uuid4())
    coords_to_save = coords or (-23.5505, -46.6333)

    response = supabase.table("cases").insert({
        "id": case_id,
        "texto_cliente": texto_cliente,
        "area": triage_result["area"],
        "subarea": triage_result["subarea"],
        "urgency_h": triage_result["urgency_h"],
        "embedding": embedding,
        "coords": coords_to_save,
        "status": "triage_completed"
    }).execute()

    if not response.data:
        raise Exception("Falha ao inserir caso no Supabase durante a triagem.")

    return {
        "case_id": case_id,
        "area": triage_result["area"],
        "subarea": triage_result["subarea"],
        "urgency_h": triage_result["urgency_h"],
        "embedding": embedding,
    }

@celery_app.task(name="tasks.run_triage_async")
def run_triage_async_task(texto_cliente: str, coords: tuple = None):
    """
    Tarefa Celery que executa o fluxo de triagem de forma assíncrona.
    """
    print(f"Iniciando triagem assíncrona para: {texto_cliente[:50]}...")
    try:
        # Executa a corrotina dentro da tarefa síncrona do Celery
        result = asyncio.run(_process_triage_flow(texto_cliente, coords))
        print(f"Triagem assíncrona concluída. Caso ID: {result['case_id']}")
        return {"status": "completed", "result": result}
    except Exception as e:
        print(f"Erro na tarefa de triagem assíncrona: {e}")
        # TODO: Adicionar lógica de retry ou notificação de falha
        return {"status": "failed", "error": str(e)}

# Funções síncronas "wrappers" para serem usadas pela tarefa Celery
# Em um cenário real, seria melhor usar `asyncio.run` ou refatorar os serviços
# para terem métodos síncronos e assíncronos.
import asyncio

def triage_service_sync_wrapper(text):
    return asyncio.run(triage_service.run_triage(text))

def generate_embedding_sync_wrapper(text):
    return asyncio.run(generate_embedding(text))

# Re-atribuição para clareza
triage_service.run_triage_sync = triage_service_sync_wrapper
generate_embedding_sync = generate_embedding_sync_wrapper 