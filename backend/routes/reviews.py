# -*- coding: utf-8 -*-
"""
Rotas para Sistema de Reviews/Avaliações - Fase 9
=================================================
Implementa feedback subjetivo dos clientes que alimenta a feature R (review_score)
do algoritmo, mantendo separado do KPI T (success_rate) do Jusbrasil.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, validator

from backend.auth import get_current_user
from backend.config import settings
from supabase.client import create_client, Client
from backend.services.reviews_service import reviews_service

router = APIRouter(prefix="/reviews", tags=["reviews"])
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# =============================================================================
# DTOs (Data Transfer Objects)
# =============================================================================


class ReviewCreate(BaseModel):
    """DTO para criação de review."""
    rating: int = Field(..., ge=1, le=5, description="Avaliação geral (1-5 estrelas)")
    comment: Optional[str] = Field(
        None,
        max_length=1000,
        description="Comentário opcional")


class ReviewUpdate(BaseModel):
    """DTO para atualização de review (apenas dentro de 7 dias)."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
    outcome: Optional[str] = None
    communication_rating: Optional[int] = Field(None, ge=1, le=5)
    expertise_rating: Optional[int] = Field(None, ge=1, le=5)
    timeliness_rating: Optional[int] = Field(None, ge=1, le=5)
    would_recommend: Optional[bool] = None


class LawyerResponseCreate(BaseModel):
    """DTO para criação de resposta do advogado."""
    message: str = Field(..., min_length=1, max_length=1000, description="Resposta do advogado")


class LawyerResponseUpdate(BaseModel):
    """DTO para atualização de resposta do advogado."""
    message: str = Field(..., min_length=1, max_length=1000, description="Resposta do advogado")


class ReviewResponse(BaseModel):
    """DTO para resposta de review."""
    id: UUID
    contract_id: UUID
    lawyer_id: UUID
    client_id: UUID
    rating: int
    comment: Optional[str] = None
    outcome: Optional[str]
    communication_rating: Optional[int]
    expertise_rating: Optional[int]
    timeliness_rating: Optional[int]
    would_recommend: Optional[bool]
    lawyer_response: Optional[str] = None
    lawyer_responded_at: Optional[datetime] = None
    response_edited_at: Optional[datetime] = None
    response_edit_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class LawyerReviewStats(BaseModel):
    """DTO para estatísticas de reviews de um advogado."""
    lawyer_id: UUID
    lawyer_name: Optional[str]
    total_reviews: int
    average_rating: Optional[float]
    positive_reviews: int  # >= 4 estrelas
    negative_reviews: int  # <= 2 estrelas
    recommendations: int
    avg_communication: Optional[float]
    avg_expertise: Optional[float]
    avg_timeliness: Optional[float]
    perceived_wins: int
    perceived_losses: int

# =============================================================================
# Endpoints
# =============================================================================


@router.post(
    "/contracts/{contract_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=ReviewResponse,
    summary="Criar avaliação para um contrato",
)
async def create_review_for_contract(
    contract_id: UUID,
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Permite que um cliente crie uma avaliação para um contrato concluído.

    - **Verifica Permissão**: Apenas o cliente associado ao contrato pode criar a avaliação.
    - **Verifica Status**: O contrato deve ter o status 'closed'.
    - **Evita Duplicidade**: Um contrato só pode ser avaliado uma vez.
    """
    try:
        contract_res = (
            supabase.table("contracts")
            .select("id, client_id, lawyer_id, status")
            .eq("id", str(contract_id))
            .single()
            .execute()
        )

        if not contract_res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contrato não encontrado")

        contract = contract_res.data
        user_id = str(current_user['id'])

        if contract["client_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas o cliente do contrato pode criar uma avaliação.")

        if contract["status"] != "closed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Avaliações são permitidas apenas para contratos concluídos.")

        existing_review = (
            supabase.table("reviews")
            .select("id")
            .eq("contract_id", str(contract_id))
            .execute()
        )

        if existing_review.data:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este contrato já possui uma avaliação.")

        review_payload = {
            "contract_id": str(contract_id),
            "lawyer_id": contract["lawyer_id"],
            "client_id": user_id,
            "rating": review_data.rating,
            "comment": review_data.comment,
        }

        insert_res = (
            supabase.table("reviews")
            .insert(review_payload)
            .select("*")
            .execute()
        )

        if not insert_res.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Não foi possível registrar a avaliação.")

        return ReviewResponse(**insert_res.data[0])

    except HTTPException:
            raise
    except Exception as e:
        # Log a exceção aqui, se necessário
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado: {e}")


@router.get("/contracts/{contract_id}/review", response_model=ReviewResponse)
async def get_contract_review(
    contract_id: UUID,
    current_user=Depends(get_current_user)
):
    """Obter avaliação de um contrato específico."""
    try:
        # Verificar se o usuário tem acesso ao contrato
        contract_result = supabase.table("contracts").select(
            "client_id, lawyer_id"
        ).eq("id", str(contract_id)).single().execute()

        if not contract_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contrato não encontrado"
            )

        contract = contract_result.data
        is_client = contract["client_id"] == current_user.id
        is_lawyer = contract["lawyer_id"] == current_user.id

        if not (is_client or is_lawyer):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado"
            )

        # Buscar a avaliação
        review_result = supabase.table("reviews").select("*").eq(
            "contract_id", str(contract_id)
        ).single().execute()

        if not review_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )

        return ReviewResponse(**review_result.data)

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: UUID,
    review_data: ReviewUpdate,
    current_user=Depends(get_current_user)
):
    """
    Atualizar avaliação (apenas dentro de 7 dias da criação).
    Apenas o cliente que criou pode atualizar.
    """
    try:
        # Verificar se a review existe e pode ser editada
        review_result = supabase.table("reviews").select(
            "*, created_at"
        ).eq("id", str(review_id)).eq("client_id", current_user.id).single().execute()

        if not review_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada ou acesso negado"
            )

        review = review_result.data

        # Verificar se ainda está dentro do prazo de edição (7 dias)
        created_at = datetime.fromisoformat(review["created_at"].replace('Z', '+00:00'))
        days_since_creation = (datetime.now().astimezone() - created_at).days

        if days_since_creation > 7:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Avaliações só podem ser editadas dentro de 7 dias da criação"
            )

        # Atualizar apenas campos fornecidos
        update_data = {k: v for k, v in review_data.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhum campo para atualizar"
            )

        result = supabase.table("reviews").update(update_data).eq(
            "id", str(review_id)
        ).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar avaliação"
            )

        return ReviewResponse(**result.data[0])

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/lawyers/{lawyer_id}/reviews", response_model=List[ReviewResponse])
async def get_lawyer_reviews(
    lawyer_id: UUID,
    limit: int = 20,
    offset: int = 0,
    current_user=Depends(get_current_user)
):
    """Obter avaliações de um advogado."""
    try:
        result = supabase.table("reviews").select("*").eq(
            "lawyer_id", str(lawyer_id)
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return [ReviewResponse(**review) for review in result.data]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/lawyers/{lawyer_id}/stats", response_model=LawyerReviewStats)
async def get_lawyer_review_stats(
    lawyer_id: UUID,
    current_user=Depends(get_current_user)
):
    """Obter estatísticas agregadas de reviews de um advogado."""
    try:
        # Usar a view criada na migração
        result = supabase.table("lawyer_review_stats").select("*").eq(
            "lawyer_id", str(lawyer_id)
        ).single().execute()

        if not result.data:
            # Se não há dados na view, retornar estatísticas zeradas
            return LawyerReviewStats(
                lawyer_id=lawyer_id,
                lawyer_name=None,
                total_reviews=0,
                average_rating=None,
                positive_reviews=0,
                negative_reviews=0,
                recommendations=0,
                avg_communication=None,
                avg_expertise=None,
                avg_timeliness=None,
                perceived_wins=0,
                perceived_losses=0
            )

        return LawyerReviewStats(**result.data)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/my-reviews", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user=Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """Obter todas as avaliações criadas pelo usuário atual."""
    try:
        result = supabase.table("reviews").select("*").eq(
            "client_id", current_user.id
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()

        return [ReviewResponse(**review) for review in result.data]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: UUID,
    current_user=Depends(get_current_user)
):
    """
    Deletar avaliação (apenas dentro de 24 horas e pelo próprio cliente).
    CUIDADO: Isso afetará as estatísticas do advogado.
    """
    try:
        # Verificar se a review existe e pode ser deletada
        review_result = supabase.table("reviews").select(
            "client_id, created_at"
        ).eq("id", str(review_id)).single().execute()

        if not review_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )

        review = review_result.data

        # Verificar permissão
        if review["client_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o autor pode deletar a avaliação"
            )

        # Verificar prazo (24 horas)
        created_at = datetime.fromisoformat(review["created_at"].replace('Z', '+00:00'))
        hours_since_creation = (datetime.now().astimezone() -
                                created_at).total_seconds() / 3600

        if hours_since_creation > 24:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Avaliações só podem ser deletadas dentro de 24 horas da criação"
            )

        # Deletar
        result = supabase.table("reviews").delete().eq("id", str(review_id)).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao deletar avaliação"
            )

        return None

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.post("/reviews/{review_id}/respond", response_model=ReviewResponse)
async def respond_to_review(
    review_id: UUID,
    response_data: LawyerResponseCreate,
    current_user=Depends(get_current_user)
):
    """
    Permite que um advogado responda a uma avaliação.
    
    - **Verifica Permissão**: Apenas o advogado responsável pelo caso pode responder
    - **Evita Duplicidade**: Não permite responder se já existe uma resposta
    - **Validação**: Resposta deve ter entre 1 e 1000 caracteres
    """
    try:
        # Verificar se a review existe e se o usuário é o advogado responsável
        review_result = supabase.table("reviews").select(
            "*, contracts!inner(lawyer_id)"
        ).eq("id", str(review_id)).single().execute()

        if not review_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )

        review = review_result.data

        # Verificar se o usuário atual é o advogado responsável
        if review["contracts"]["lawyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o advogado responsável pode responder à avaliação"
            )

        # Verificar se já existe uma resposta
        if review.get("lawyer_response"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Esta avaliação já possui uma resposta"
            )

        # Atualizar a review com a resposta
        update_data = {
            "lawyer_response": response_data.message,
            "lawyer_responded_at": datetime.now().isoformat(),
            "response_edit_count": 0
        }

        result = supabase.table("reviews").update(update_data).eq(
            "id", str(review_id)
        ).select("*").execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao salvar resposta"
            )

        return ReviewResponse(**result.data[0])

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.put("/reviews/{review_id}/response", response_model=ReviewResponse)
async def update_review_response(
    review_id: UUID,
    response_data: LawyerResponseUpdate,
    current_user=Depends(get_current_user)
):
    """
    Permite que um advogado edite sua resposta a uma avaliação.
    
    - **Prazo**: Apenas dentro de 24 horas da resposta original
    - **Limite**: Máximo de 3 edições por resposta
    """
    try:
        # Verificar se a review existe e se o usuário é o advogado responsável
        review_result = supabase.table("reviews").select(
            "*, contracts!inner(lawyer_id)"
        ).eq("id", str(review_id)).single().execute()

        if not review_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )

        review = review_result.data

        # Verificar se o usuário atual é o advogado responsável
        if review["contracts"]["lawyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o advogado responsável pode editar a resposta"
            )

        # Verificar se existe uma resposta
        if not review.get("lawyer_response"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nenhuma resposta encontrada para editar"
            )

        # Verificar prazo de edição (24 horas)
        if review.get("lawyer_responded_at"):
            responded_at = datetime.fromisoformat(
                review["lawyer_responded_at"].replace('Z', '+00:00')
            )
            hours_since_response = (datetime.now().astimezone() - responded_at).total_seconds() / 3600

            if hours_since_response > 24:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Respostas só podem ser editadas dentro de 24 horas"
                )

        # Verificar limite de edições
        edit_count = review.get("response_edit_count", 0)
        if edit_count >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limite de edições excedido (máximo 3)"
            )

        # Atualizar a resposta
        update_data = {
            "lawyer_response": response_data.message,
            "response_edited_at": datetime.now().isoformat(),
            "response_edit_count": edit_count + 1
        }

        result = supabase.table("reviews").update(update_data).eq(
            "id", str(review_id)
        ).select("*").execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao atualizar resposta"
            )

        return ReviewResponse(**result.data[0])

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.delete("/reviews/{review_id}/response", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review_response(
    review_id: UUID,
    current_user=Depends(get_current_user)
):
    """
    Permite que um advogado remova sua resposta a uma avaliação.
    
    - **Prazo**: Apenas dentro de 1 hora da resposta original
    """
    try:
        # Verificar se a review existe e se o usuário é o advogado responsável
        review_result = supabase.table("reviews").select(
            "*, contracts!inner(lawyer_id)"
        ).eq("id", str(review_id)).single().execute()

        if not review_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )

        review = review_result.data

        # Verificar se o usuário atual é o advogado responsável
        if review["contracts"]["lawyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o advogado responsável pode remover a resposta"
            )

        # Verificar prazo de remoção (1 hora)
        if review.get("lawyer_responded_at"):
            responded_at = datetime.fromisoformat(
                review["lawyer_responded_at"].replace('Z', '+00:00')
            )
            hours_since_response = (datetime.now().astimezone() - responded_at).total_seconds() / 3600

            if hours_since_response > 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Respostas só podem ser removidas dentro de 1 hora"
                )

        # Remover a resposta
        update_data = {
            "lawyer_response": None,
            "lawyer_responded_at": None,
            "response_edited_at": None,
            "response_edit_count": 0
        }

        result = supabase.table("reviews").update(update_data).eq(
            "id", str(review_id)
        ).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao remover resposta"
            )

        return None

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.get("/lawyers/my-reviews", response_model=List[ReviewResponse])
async def get_my_lawyer_reviews(
    current_user=Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    needs_response: bool = False
):
    """
    Obter todas as avaliações recebidas pelo advogado atual.
    
    - **needs_response**: Se True, retorna apenas avaliações sem resposta
    """
    try:
        query = supabase.table("reviews").select("*").eq(
            "lawyer_id", current_user.id
        )

        if needs_response:
            query = query.is_("lawyer_response", "null")

        result = query.order("created_at", desc=True).range(
            offset, offset + limit - 1
        ).execute()

        return [ReviewResponse(**review) for review in result.data]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )


@router.post("/", response_model=ReviewResponse)
async def submit_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Submete uma nova avaliação para um contrato.
    """
    client_id = current_user.get("id")
    if not client_id:
        raise HTTPException(status_code=401, detail="Usuário não autenticado.")

    try:
        new_review = await reviews_service.create_review(
            client_id=client_id,
            contract_id=review_data.contract_id,
            rating=review_data.rating,
            comment=review_data.comment
        )
        return new_review
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lawyer/{lawyer_id}", response_model=List[ReviewResponse])
async def get_lawyer_reviews(lawyer_id: UUID):
    """
    Busca todas as avaliações de um advogado específico.
    """
    try:
        reviews = await reviews_service.get_reviews_by_lawyer(lawyer_id)
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
