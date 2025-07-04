"""
Serviço de Matchmaking, responsável por orquestrar o ranking e as notificações.
"""
import os
import time
import numpy as np
from typing import List, Dict, Any, Optional

from supabase import create_client, Client
from dotenv import load_dotenv

from backend.algoritmo_match import Case, Lawyer, KPI, MatchmakingAlgorithm, haversine
from backend.models import MatchRequest
from backend.services.notify_service import send_notifications_to_lawyers
from backend.services.offer_service import create_offers_from_ranking

# --- Configuração ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
algo = MatchmakingAlgorithm()

async def find_and_notify_matches(req: MatchRequest) -> Optional[Dict[str, Any]]:
    """
    Orquestra o processo de match:
    1. Encontra advogados compatíveis para um caso.
    2. Notifica os advogados encontrados.
    3. Formata e retorna a resposta para a API.
    """
    # 1. Carregar dados do caso
    case_row = supabase.table("cases").select("*").eq("id", req.case_id).single().execute().data
    if not case_row:
        return None

    case = Case(
        id=case_row["id"],
        area=case_row["area"],
        subarea=case_row["subarea"],
        urgency_h=case_row["urgency_h"],
        coords=tuple(case_row["coords"]),
        summary_embedding=np.array(case_row["summary_embedding"], dtype=np.float32),
    )

    # 2. Carregar advogados candidatos — tentativa de filtro geo via RPC
    try:
        rpc_params = {
            "area": case.area,
            "lat": case.coords[0],
            "lon": case.coords[1],
            "km": 50,
        }
        lawyer_rows = supabase.rpc("find_nearby_lawyers", rpc_params).execute().data
    except Exception:
        # Fallback para filtro somente por área
        lawyer_rows = supabase.table("lawyers").select("*").contains("tags_expertise", [case.area]).execute().data
    
    candidates = [
        Lawyer(
            id=r["id"],
            nome=r["nome"],
            tags_expertise=r["tags_expertise"],
            geo_latlon=tuple(r["geo_latlon"]),
            curriculo_json=r.get("curriculo_json", {}),
            casos_historicos_embeddings=[np.array(v) for v in r.get("casos_historicos_embeddings", [])],
            kpi=KPI(**r.get("kpi", {})),
        ) for r in lawyer_rows
    ]
    
    # 3. Executar o algoritmo de ranking
    top_lawyers = algo.rank(case, candidates, top_n=req.k)

    if not top_lawyers:
        return {"case_id": case.id, "matches": []}

    # 4. Criar ofertas para os advogados (Fase 4 - Sinal de Interesse)
    offer_ids = await create_offers_from_ranking(case, top_lawyers)
    
    # 5. Enviar notificações (assíncrono, não bloqueia a resposta)
    lawyer_ids = [lw.id for lw in top_lawyers]
    notification_payload = {
        "case_id": case.id,
        "headline": f"Novo caso na área de {case.area}",
        "summary": f"Um novo caso com urgência de {case.urgency_h}h está disponível para seu perfil.",
        "offer_ids": offer_ids  # Incluir IDs das ofertas para referência
    }
    await send_notifications_to_lawyers(lawyer_ids, notification_payload)

    # 6. Persistir `last_offered_at` e formatar resposta
    now = time.time()
    supabase.table("lawyers").update({"last_offered_at": now}).in_("id", lawyer_ids).execute()
    
    lawyer_raw_data = {r['id']: r for r in lawyer_rows}
    response = format_match_response(case, top_lawyers, lawyer_raw_data)
    
    return response

def format_match_response(case: Case, ranked_lawyers: List[Lawyer], raw_data_map: Dict) -> Dict[str, Any]:
    """Formata a resposta do endpoint de match."""
    matches_response = []
    for lw in ranked_lawyers:
        raw_data = raw_data_map.get(lw.id)
        if not raw_data:
            continue

        matches_response.append({
            "lawyer_id": lw.id,
            "nome": lw.nome,
            "fair": lw.scores.get("fair", 0),
            "equity": lw.scores.get("equity", 0),
            "features": lw.scores.get("features", {}),
            "avatar_url": raw_data.get("avatar_url"),
            "is_available": raw_data.get("is_available", False),
            "rating": lw.kpi.avaliacao_media,
            "distance_km": haversine(case.coords, lw.geo_latlon),
        })
        
    return {"case_id": case.id, "matches": matches_response} 