"""
Rotas para o módulo de ofertas (Fases 4 & 5 do fluxo de match).
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from uuid import UUID
from typing import List, Optional

from backend.models import (
    Offer, OfferStatusUpdate, OffersListResponse, 
    OfferResponse
)
from backend.services.offer_service import (
    update_offer_status, get_offers_by_case, 
    get_lawyer_offers, get_offer_stats
)
from backend.auth import get_current_user

# Configuração do rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/offers", tags=["offers"])


@router.patch("/{offer_id}", response_model=OfferResponse)
@limiter.limit("30/minute")
async def update_offer(
    request: Request,
    offer_id: UUID, 
    status_update: OfferStatusUpdate,
    user: dict = Depends(get_current_user)
):
    """
    Atualiza o status de uma oferta (advogado aceita ou recusa).
    Apenas o advogado dono da oferta pode atualizá-la.
    """
    # Verifica se o usuário é um advogado
    if user.get("role") != "lawyer":
        raise HTTPException(
            status_code=403, 
            detail="Apenas advogados podem responder a ofertas"
        )
    
    lawyer_id = UUID(user["id"])
    
    try:
        updated_offer = await update_offer_status(offer_id, status_update, lawyer_id)
        
        if not updated_offer:
            raise HTTPException(
                status_code=404, 
                detail="Oferta não encontrada ou não pertence a este advogado"
            )
        
        return OfferResponse(
            id=updated_offer.id,
            case_id=updated_offer.case_id,
            lawyer_id=updated_offer.lawyer_id,
            status=updated_offer.status,
            sent_at=updated_offer.sent_at,
            responded_at=updated_offer.responded_at,
            expires_at=updated_offer.expires_at,
            fair_score=updated_offer.fair_score
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar oferta: {e}")


@router.get("/case/{case_id}", response_model=OffersListResponse)
async def get_case_offers(
    case_id: UUID,
    user: dict = Depends(get_current_user)
):
    """
    Lista todas as ofertas de um caso.
    Apenas o cliente dono do caso pode ver as ofertas.
    """
    # Verifica se o usuário é um cliente
    if user.get("role") != "client":
        raise HTTPException(
            status_code=403, 
            detail="Apenas clientes podem ver ofertas de seus casos"
        )
    
    client_id = UUID(user["id"])
    
    try:
        offers_response = await get_offers_by_case(case_id, client_id)
        return offers_response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ofertas: {e}")


@router.get("/lawyer/my-offers", response_model=List[Offer])
async def get_my_offers(
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """
    Lista ofertas recebidas por um advogado.
    Opcionalmente filtra por status.
    """
    # Verifica se o usuário é um advogado
    if user.get("role") != "lawyer":
        raise HTTPException(
            status_code=403, 
            detail="Apenas advogados podem ver suas ofertas"
        )
    
    lawyer_id = UUID(user["id"])
    
    try:
        offers = await get_lawyer_offers(lawyer_id, status)
        return offers
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ofertas: {e}")


@router.get("/case/{case_id}/stats")
async def get_case_offer_stats(
    case_id: UUID,
    user: dict = Depends(get_current_user)
):
    """
    Retorna estatísticas das ofertas de um caso.
    Apenas o cliente dono do caso pode ver as estatísticas.
    """
    # Verifica se o usuário é um cliente
    if user.get("role") != "client":
        raise HTTPException(
            status_code=403, 
            detail="Apenas clientes podem ver estatísticas de seus casos"
        )
    
    try:
        stats = await get_offer_stats(case_id)
        return stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {e}")


@router.get("/lawyer/{lawyer_id}/pending", response_model=List[Offer])
async def get_lawyer_pending_offers(
    lawyer_id: UUID,
    user: dict = Depends(get_current_user)
):
    """
    Lista ofertas pendentes de um advogado específico.
    Útil para notificações e dashboards.
    """
    # Verifica se o usuário é o próprio advogado ou admin
    if user.get("role") not in ["lawyer", "admin"] or (
        user.get("role") == "lawyer" and UUID(user["id"]) != lawyer_id
    ):
        raise HTTPException(
            status_code=403, 
            detail="Acesso negado"
        )
    
    try:
        offers = await get_lawyer_offers(lawyer_id, status="pending")
        return offers
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ofertas pendentes: {e}") 