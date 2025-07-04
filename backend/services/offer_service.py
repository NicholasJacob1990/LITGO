"""
Serviço para gerenciar ofertas de casos para advogados.
Implementa as Fases 4 & 5 do fluxo de match: Sinal de Interesse e Exibição.
"""
import os
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from supabase import create_client, Client
from dotenv import load_dotenv

from backend.models import Offer, OfferCreate, OfferStatusUpdate, OffersListResponse
from backend.algoritmo_match import Lawyer, Case, AUDIT_LOGGER

# --- Configuração ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """Cria e retorna um cliente Supabase."""
    if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY]):
        raise ValueError("Variáveis de ambiente do Supabase não configuradas.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def create_offers_from_ranking(case: Case, ranking: List[Lawyer]) -> List[str]:
    """
    Cria ofertas para os advogados do ranking.
    Retorna lista de IDs das ofertas criadas.
    """
    if not ranking:
        logger.info(f"Nenhum advogado no ranking para o caso {case.id}")
        return []
    
    supabase = get_supabase_client()
    
    # Prepara dados das ofertas
    offers_data = []
    for lawyer in ranking:
        offer_data = {
            "case_id": str(case.id),
            "lawyer_id": str(lawyer.id),
            "fair_score": lawyer.scores.get("fair", 0.0),
            "raw_score": lawyer.scores.get("raw", 0.0),
            "equity_weight": lawyer.scores.get("equity", 0.0),
            "last_offered_at": lawyer.last_offered_at,
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
        }
        offers_data.append(offer_data)
    
    try:
        # Insere as ofertas (upsert para evitar duplicatas)
        response = supabase.table("offers").upsert(offers_data).execute()
        
        offer_ids = [str(offer["id"]) for offer in response.data]
        logger.info(f"Criadas {len(offer_ids)} ofertas para o caso {case.id}")
        
        return offer_ids
    
    except Exception as e:
        logger.error(f"Erro ao criar ofertas para o caso {case.id}: {e}")
        raise


async def update_offer_status(offer_id: UUID, status_update: OfferStatusUpdate, lawyer_id: UUID) -> Optional[Offer]:
    """
    Atualiza o status de uma oferta e loga o evento para LTR.
    Valida se o advogado tem permissão para atualizar a oferta.
    """
    supabase = get_supabase_client()
    
    try:
        # Busca a oferta, incluindo os scores para o log de auditoria
        existing_offer_response = supabase.table("offers") \
            .select("*, case:cases(id), lawyer:lawyers(id)") \
            .eq("id", str(offer_id)) \
            .eq("lawyer_id", str(lawyer_id)) \
            .single() \
            .execute()
        
        if not existing_offer_response.data:
            logger.warning(f"Oferta {offer_id} não encontrada ou não pertence ao advogado {lawyer_id}")
            return None
        
        existing_offer = existing_offer_response.data

        # Verifica se a oferta ainda está pendente
        if existing_offer["status"] != "pending":
            logger.warning(f"Oferta {offer_id} não está mais pendente (status: {existing_offer['status']})")
            return None
        
        # Atualiza o status
        update_data = {
            "status": status_update.status,
            "responded_at": datetime.utcnow().isoformat(),
        }
        
        updated_offer_response = supabase.table("offers") \
            .update(update_data) \
            .eq("id", str(offer_id)) \
            .single() \
            .execute()
        
        logger.info(f"Oferta {offer_id} atualizada para status '{status_update.status}' pelo advogado {lawyer_id}")
        
        # --- Log de Auditoria para LTR ---
        AUDIT_LOGGER.info(
            "feedback",
            extra={
                "case": existing_offer["case"]["id"],
                "lawyer": existing_offer["lawyer"]["id"],
                "label": status_update.status, # 'accepted' or 'declined'
                # As features viriam dos scores salvos na oferta
                "raw_score": existing_offer.get("raw_score"),
                "fair_score": existing_offer.get("fair_score")
            }
        )

        return Offer(**updated_offer_response.data)
    
    except Exception as e:
        logger.error(f"Erro ao atualizar oferta {offer_id}: {e}")
        raise


async def get_offers_by_case(case_id: UUID, client_id: UUID) -> OffersListResponse:
    """
    Lista todas as ofertas de um caso.
    Valida se o cliente tem permissão para ver as ofertas.
    """
    supabase = get_supabase_client()
    
    try:
        # Verifica se o caso pertence ao cliente
        case_check = supabase.table("cases")\
            .select("id")\
            .eq("id", str(case_id))\
            .eq("client_id", str(client_id))\
            .single()\
            .execute()
        
        if not case_check.data:
            logger.warning(f"Caso {case_id} não encontrado ou não pertence ao cliente {client_id}")
            return OffersListResponse(
                case_id=case_id,
                offers=[],
                total=0,
                interested_count=0,
                pending_count=0
            )
        
        # Busca as ofertas do caso
        offers_response = supabase.table("offers")\
            .select("*, lawyer:lawyers(nome, avatar_url, rating)")\
            .eq("case_id", str(case_id))\
            .order("fair_score", desc=True)\
            .execute()
        
        offers = [Offer(**offer) for offer in offers_response.data]
        
        # Conta estatísticas
        total = len(offers)
        interested_count = sum(1 for offer in offers if offer.status == "interested")
        pending_count = sum(1 for offer in offers if offer.status == "pending")
        
        logger.info(f"Listadas {total} ofertas para o caso {case_id}")
        
        return OffersListResponse(
            case_id=case_id,
            offers=offers,
            total=total,
            interested_count=interested_count,
            pending_count=pending_count
        )
    
    except Exception as e:
        logger.error(f"Erro ao listar ofertas do caso {case_id}: {e}")
        raise


async def get_lawyer_offers(lawyer_id: UUID, status: Optional[str] = None) -> List[Offer]:
    """
    Lista ofertas de um advogado, opcionalmente filtradas por status.
    """
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("offers")\
            .select("*, case:cases(area, subarea, urgency_h, texto_cliente)")\
            .eq("lawyer_id", str(lawyer_id))\
            .order("sent_at", desc=True)
        
        if status:
            query = query.eq("status", status)
        
        offers_response = query.execute()
        offers = [Offer(**offer) for offer in offers_response.data]
        
        logger.info(f"Listadas {len(offers)} ofertas para o advogado {lawyer_id}")
        
        return offers
    
    except Exception as e:
        logger.error(f"Erro ao listar ofertas do advogado {lawyer_id}: {e}")
        raise


async def close_other_offers(case_id: UUID, accepted_offer_id: UUID) -> int:
    """
    Fecha todas as outras ofertas de um caso quando uma é aceita.
    Retorna o número de ofertas fechadas.
    """
    supabase = get_supabase_client()
    
    try:
        # Atualiza todas as ofertas do caso, exceto a aceita
        response = supabase.table("offers")\
            .update({"status": "closed", "updated_at": datetime.utcnow().isoformat()})\
            .eq("case_id", str(case_id))\
            .neq("id", str(accepted_offer_id))\
            .in_("status", ["pending", "interested"])\
            .execute()
        
        closed_count = len(response.data)
        logger.info(f"Fechadas {closed_count} ofertas do caso {case_id}")
        
        return closed_count
    
    except Exception as e:
        logger.error(f"Erro ao fechar ofertas do caso {case_id}: {e}")
        raise


async def expire_pending_offers() -> int:
    """
    Expira ofertas pendentes que passaram do prazo.
    Função para ser executada via cron job.
    """
    supabase = get_supabase_client()
    
    try:
        # Chama a função SQL que expira ofertas
        response = supabase.rpc("expire_pending_offers").execute()
        
        expired_count = response.data if response.data else 0
        logger.info(f"Expiradas {expired_count} ofertas pendentes")
        
        return expired_count
    
    except Exception as e:
        logger.error(f"Erro ao expirar ofertas pendentes: {e}")
        raise


async def get_offer_stats(case_id: UUID) -> Dict[str, Any]:
    """
    Retorna estatísticas das ofertas de um caso.
    """
    supabase = get_supabase_client()
    
    try:
        # Busca estatísticas agregadas
        stats_response = supabase.table("offers")\
            .select("status")\
            .eq("case_id", str(case_id))\
            .execute()
        
        offers = stats_response.data
        total = len(offers)
        
        if total == 0:
            return {
                "total": 0,
                "pending": 0,
                "interested": 0,
                "declined": 0,
                "expired": 0,
                "closed": 0,
                "response_rate": 0.0
            }
        
        # Conta por status
        status_counts = {}
        for offer in offers:
            status = offer["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        responded = status_counts.get("interested", 0) + status_counts.get("declined", 0)
        response_rate = (responded / total) * 100 if total > 0 else 0.0
        
        return {
            "total": total,
            "pending": status_counts.get("pending", 0),
            "interested": status_counts.get("interested", 0),
            "declined": status_counts.get("declined", 0),
            "expired": status_counts.get("expired", 0),
            "closed": status_counts.get("closed", 0),
            "response_rate": round(response_rate, 2)
        }
    
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do caso {case_id}: {e}")
        raise
