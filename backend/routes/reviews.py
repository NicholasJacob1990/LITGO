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
from supabase import create_client

from backend.auth import get_current_user
from backend.config import settings

router = APIRouter(prefix="/reviews", tags=["reviews"])
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# =============================================================================
# DTOs (Data Transfer Objects)
# =============================================================================

class ReviewCreate(BaseModel):
    """DTO para criação de review."""
    rating: int = Field(..., ge=1, le=5, description="Avaliação geral (1-5 estrelas)")
    comment: Optional[str] = Field(None, max_length=1000, description="Comentário opcional")
    outcome: Optional[str] = Field(None, description="Resultado percebido: won, lost, settled, ongoing")
    communication_rating: Optional[int] = Field(None, ge=1, le=5)
    expertise_rating: Optional[int] = Field(None, ge=1, le=5)
    timeliness_rating: Optional[int] = Field(None, ge=1, le=5)
    would_recommend: Optional[bool] = Field(None, description="Recomendaria o advogado?")
    
    @validator('outcome')
    def validate_outcome(cls, v):
        if v and v not in ['won', 'lost', 'settled', 'ongoing']:
            raise ValueError('outcome deve ser: won, lost, settled ou ongoing')
        return v

class ReviewUpdate(BaseModel):
    """DTO para atualização de review (apenas dentro de 7 dias)."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
    outcome: Optional[str] = None
    communication_rating: Optional[int] = Field(None, ge=1, le=5)
    expertise_rating: Optional[int] = Field(None, ge=1, le=5)
    timeliness_rating: Optional[int] = Field(None, ge=1, le=5)
    would_recommend: Optional[bool] = None

class ReviewResponse(BaseModel):
    """DTO para resposta de review."""
    id: UUID
    contract_id: UUID
    lawyer_id: UUID
    client_id: UUID
    rating: int
    comment: Optional[str]
    outcome: Optional[str]
    communication_rating: Optional[int]
    expertise_rating: Optional[int]
    timeliness_rating: Optional[int]
    would_recommend: Optional[bool]
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

@router.post("/contracts/{contract_id}/review", status_code=status.HTTP_201_CREATED, response_model=ReviewResponse)
async def create_review(
    contract_id: UUID,
    review_data: ReviewCreate,
    current_user = Depends(get_current_user)
):
    """
    Criar avaliação para um contrato concluído.
    
    Regras:
    - Apenas o cliente pode avaliar
    - Contrato deve estar com status 'closed'
    - Cada contrato pode ter apenas uma avaliação
    """
    try:
        # 1. Verificar se o contrato existe e pertence ao cliente
        contract_result = supabase.table("contracts").select(
            "id, client_id, lawyer_id, status"
        ).eq("id", str(contract_id)).single().execute()
        
        if not contract_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contrato não encontrado"
            )
        
        contract = contract_result.data
        
        # 2. Verificar permissões
        if contract["client_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o cliente pode avaliar este contrato"
            )
        
        # 3. Verificar se contrato está fechado
        if contract["status"] != "closed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Apenas contratos concluídos podem ser avaliados"
            )
        
        # 4. Verificar se já existe avaliação
        existing_review = supabase.table("reviews").select("id").eq(
            "contract_id", str(contract_id)
        ).execute()
        
        if existing_review.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este contrato já foi avaliado"
            )
        
        # 5. Criar a avaliação
        review_insert = {
            "contract_id": str(contract_id),
            "lawyer_id": contract["lawyer_id"],
            "client_id": current_user.id,
            **review_data.dict(exclude_none=True)
        }
        
        result = supabase.table("reviews").insert(review_insert).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar avaliação"
            )
        
        return ReviewResponse(**result.data[0])
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/contracts/{contract_id}/review", response_model=ReviewResponse)
async def get_contract_review(
    contract_id: UUID,
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user),
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
    current_user = Depends(get_current_user)
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
        hours_since_creation = (datetime.now().astimezone() - created_at).total_seconds() / 3600
        
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
from supabase import create_client

from backend.auth import get_current_user
from backend.config import settings

router = APIRouter(prefix="/reviews", tags=["reviews"])
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# =============================================================================
# DTOs (Data Transfer Objects)
# =============================================================================

class ReviewCreate(BaseModel):
    """DTO para criação de review."""
    rating: int = Field(..., ge=1, le=5, description="Avaliação geral (1-5 estrelas)")
    comment: Optional[str] = Field(None, max_length=1000, description="Comentário opcional")
    outcome: Optional[str] = Field(None, description="Resultado percebido: won, lost, settled, ongoing")
    communication_rating: Optional[int] = Field(None, ge=1, le=5)
    expertise_rating: Optional[int] = Field(None, ge=1, le=5)
    timeliness_rating: Optional[int] = Field(None, ge=1, le=5)
    would_recommend: Optional[bool] = Field(None, description="Recomendaria o advogado?")
    
    @validator('outcome')
    def validate_outcome(cls, v):
        if v and v not in ['won', 'lost', 'settled', 'ongoing']:
            raise ValueError('outcome deve ser: won, lost, settled ou ongoing')
        return v

class ReviewUpdate(BaseModel):
    """DTO para atualização de review (apenas dentro de 7 dias)."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
    outcome: Optional[str] = None
    communication_rating: Optional[int] = Field(None, ge=1, le=5)
    expertise_rating: Optional[int] = Field(None, ge=1, le=5)
    timeliness_rating: Optional[int] = Field(None, ge=1, le=5)
    would_recommend: Optional[bool] = None

class ReviewResponse(BaseModel):
    """DTO para resposta de review."""
    id: UUID
    contract_id: UUID
    lawyer_id: UUID
    client_id: UUID
    rating: int
    comment: Optional[str]
    outcome: Optional[str]
    communication_rating: Optional[int]
    expertise_rating: Optional[int]
    timeliness_rating: Optional[int]
    would_recommend: Optional[bool]
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

@router.post("/contracts/{contract_id}/review", status_code=status.HTTP_201_CREATED, response_model=ReviewResponse)
async def create_review(
    contract_id: UUID,
    review_data: ReviewCreate,
    current_user = Depends(get_current_user)
):
    """
    Criar avaliação para um contrato concluído.
    
    Regras:
    - Apenas o cliente pode avaliar
    - Contrato deve estar com status 'closed'
    - Cada contrato pode ter apenas uma avaliação
    """
    try:
        # 1. Verificar se o contrato existe e pertence ao cliente
        contract_result = supabase.table("contracts").select(
            "id, client_id, lawyer_id, status"
        ).eq("id", str(contract_id)).single().execute()
        
        if not contract_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contrato não encontrado"
            )
        
        contract = contract_result.data
        
        # 2. Verificar permissões
        if contract["client_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o cliente pode avaliar este contrato"
            )
        
        # 3. Verificar se contrato está fechado
        if contract["status"] != "closed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Apenas contratos concluídos podem ser avaliados"
            )
        
        # 4. Verificar se já existe avaliação
        existing_review = supabase.table("reviews").select("id").eq(
            "contract_id", str(contract_id)
        ).execute()
        
        if existing_review.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este contrato já foi avaliado"
            )
        
        # 5. Criar a avaliação
        review_insert = {
            "contract_id": str(contract_id),
            "lawyer_id": contract["lawyer_id"],
            "client_id": current_user.id,
            **review_data.dict(exclude_none=True)
        }
        
        result = supabase.table("reviews").insert(review_insert).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar avaliação"
            )
        
        return ReviewResponse(**result.data[0])
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )

@router.get("/contracts/{contract_id}/review", response_model=ReviewResponse)
async def get_contract_review(
    contract_id: UUID,
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user)
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
    current_user = Depends(get_current_user),
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
    current_user = Depends(get_current_user)
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
        hours_since_creation = (datetime.now().astimezone() - created_at).total_seconds() / 3600
        
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