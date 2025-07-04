#!/usr/bin/env python3
# backend/jobs/jusbrasil_sync.py
"""
Job para sincronizar a taxa de sucesso dos advogados a partir da API do Jusbrasil.

Este script substitui o antigo `datajud_sync.py`, trocando a fonte de dados
para o Jusbrasil PRO API, que oferece dados mais estruturados e confiáveis.
"""
import os
import sys
import asyncio
import httpx
import logging
import json
from datetime import datetime

# Adiciona o diretório raiz ao path para importações
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from supabase import create_client, Client
from dotenv import load_dotenv

# --- Configuração ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
JUS_API_URL = os.getenv("JUS_API_URL", "https://api.jusbrasil.com.br/v2")
JUS_API_TOKEN = os.getenv("JUS_API_TOKEN")

# Configurar logging estruturado
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    """Cria e retorna um cliente Supabase."""
    if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, JUS_API_TOKEN]):
        raise ValueError("Variáveis de ambiente (Supabase, Jusbrasil) não configuradas.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def fetch_success_rate_for_lawyer(client: httpx.AsyncClient, oab_number: str) -> float:
    """
    Consulta a API do Jusbrasil para obter a taxa de sucesso de um advogado.
    
    A lógica de cálculo (procedente / total) é um exemplo. A API real do Jusbrasil
    pode fornecer dados mais detalhados que permitem um cálculo mais sofisticado.
    """
    if not oab_number:
        return 0.0

    headers = {
        "Authorization": f"Bearer {JUS_API_TOKEN}",
        "User-Agent": "LITGO5/2.0 (Sistema de Match Jurídico via Jusbrasil)"
    }
    
    # Exemplo: /advogados/{oab}/processos
    # Adapte o endpoint conforme a documentação da API do Jusbrasil
    request_url = f"{JUS_API_URL}/advogados/{oab_number.replace('/', '-')}/processos"
    
    try:
        response = await client.get(request_url, headers=headers)
        response.raise_for_status()  # Lança exceção para status 4xx/5xx
        
        data = response.json()
        
        # Simulação de análise de processos - ajuste conforme a resposta real da API
        # Ex: data['processos'], data['metadata']['total']
        processes = data.get("data", [])
        if not processes:
            return 0.0
            
        wins = sum(1 for p in processes if str(p.get("resultado", "")).lower() == "procedente")
        total_cases = len(processes)
        
        return wins / total_cases if total_cases > 0 else 0.0

    except httpx.HTTPStatusError as e:
        logger.error(json.dumps({
            "event": "jusbrasil_api_error",
            "oab": oab_number,
            "status_code": e.response.status_code,
            "error": "Erro na API Jusbrasil"
        }))
        return 0.0
    except Exception as e:
        logger.error(json.dumps({
            "event": "jusbrasil_sync_error",
            "oab": oab_number,
            "error": str(e)
        }))
        return 0.0


async def sync_all_lawyers():
    """
    Busca todos os advogados e atualiza sua taxa de sucesso a partir do Jusbrasil.
    """
    start_time = datetime.now()
    logger.info(json.dumps({
        "event": "job_started",
        "job": "jusbrasil_sync",
        "timestamp": start_time.isoformat()
    }))
    
    try:
        supabase = get_supabase_client()
        
        # Busca advogados ativos com OAB
        lawyers_response = supabase.table("lawyers")\
            .select("id, oab_number, kpi")\
            .not_.is_("oab_number", "null")\
            .execute()
        
        lawyers = lawyers_response.data
        if not lawyers:
            logger.info(json.dumps({"event": "no_lawyers_found", "message": "Nenhum advogado com OAB para sincronizar."}))
            return

        total_processed = 0
        total_updated = 0
        
        async with httpx.AsyncClient(timeout=45.0) as client:
            tasks = []
            for lawyer in lawyers:
                tasks.append(process_lawyer(client, supabase, lawyer))
            
            results = await asyncio.gather(*tasks)
        
        total_processed = len(results)
        total_updated = sum(1 for r in results if r)

    finally:
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        logger.info(json.dumps({
            "event": "job_completed",
            "total_processed": total_processed,
            "total_updated": total_updated,
            "duration_seconds": f"{duration:.2f}",
            "timestamp": end_time.isoformat()
        }))

async def process_lawyer(client: httpx.AsyncClient, supabase: Client, lawyer: dict) -> bool:
    """Processa um único advogado, busca a taxa e atualiza no banco."""
    oab = lawyer.get("oab_number")
    lawyer_id = lawyer.get("id")

    success_rate = await fetch_success_rate_for_lawyer(client, oab)
    
    current_kpi = lawyer.get("kpi") or {}
    updated_kpi = {
        **current_kpi,
        "success_rate": success_rate,
        "last_kpi_sync_source": "jusbrasil",
        "last_kpi_sync_at": datetime.now().isoformat()
    }
    
    try:
        supabase.table("lawyers").update({"kpi": updated_kpi}).eq("id", lawyer_id).execute()
        logger.info(json.dumps({
            "event": "lawyer_updated",
            "lawyer_id": lawyer_id,
            "oab": oab,
            "success_rate": success_rate
        }))
        return True
    except Exception as e:
        logger.error(json.dumps({
            "event": "supabase_update_error",
            "lawyer_id": lawyer_id,
            "error": str(e)
        }))
        return False


if __name__ == "__main__":
    if not all([os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"), os.getenv("JUS_API_TOKEN")]):
        print("ERRO: Configure as variáveis de ambiente necessárias em um arquivo .env")
        print("SUPABASE_URL, SUPABASE_SERVICE_KEY, JUS_API_URL, JUS_API_TOKEN")
    else:
        asyncio.run(sync_all_lawyers()) 