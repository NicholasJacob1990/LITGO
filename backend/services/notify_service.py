"""
Serviço para enviar notificações aos advogados (Push e E-mail).
"""
import os
import httpx
import logging
import json
import asyncio
from typing import List, Dict, Any
from redis import Redis

from supabase import create_client, Client
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# --- Configuração ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID")
ONESIGNAL_API_KEY = os.getenv("ONESIGNAL_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Configurar logging
logger = logging.getLogger(__name__)

redis_client = Redis.from_url(REDIS_URL)

def get_supabase_client() -> Client:
    """Cria e retorna um cliente Supabase."""
    if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY]):
        raise ValueError("Variáveis de ambiente do Supabase não configuradas.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def send_notifications_to_lawyers(lawyer_ids: List[str], payload: Dict[str, Any]):
    """
    Envia notificações para uma lista de advogados via Push (OneSignal) e E-mail (fallback).
    """
    if not lawyer_ids:
        logger.info("Nenhum advogado para notificar.")
        return

    # Lê as variáveis de ambiente dinamicamente para permitir mocking em testes
    onesignal_app_id = os.getenv("ONESIGNAL_APP_ID")
    onesignal_api_key = os.getenv("ONESIGNAL_API_KEY")
    
    if not onesignal_app_id or not onesignal_api_key:
        logger.warning("Variáveis do OneSignal não configuradas. Notificações push desabilitadas.")
        return

    supabase = get_supabase_client()
    
    try:
        # Busca os tokens de push e e-mails dos advogados
        lawyers_response = supabase.table("lawyers")\
            .select("id, profile:profiles(push_token, email)")\
            .in_("id", lawyer_ids)\
            .execute()
            
        lawyers = lawyers_response.data
        
        async with httpx.AsyncClient() as client:
            tasks = []
            for lawyer in lawyers:
                # --- Guard-rail de Rate Limiting ---
                rate_limit_key = f"notify_ratelimit:{lawyer['id']}"
                if redis_client.exists(rate_limit_key):
                    logger.warning(f"Rate limit atingido para o advogado {lawyer['id']}. Notificação pulada.")
                    continue
                
                profile = lawyer.get("profile")
                if not profile:
                    continue
                
                # Prioriza notificação Push
                if profile.get("push_token"):
                    tasks.append(_send_onesignal_push(client, profile["push_token"], payload, onesignal_app_id, onesignal_api_key))
                # Fallback para E-mail
                elif profile.get("email"):
                    tasks.append(_send_email_notification(supabase, profile["email"], payload))
                
                # Define o rate limit no Redis após agendar a notificação
                redis_client.set(rate_limit_key, 1, ex=300) # Expira em 5 minutos
            
            await asyncio.gather(*tasks)

    except Exception as e:
        logger.error(f"Erro ao buscar dados dos advogados para notificação: {e}")


async def _send_onesignal_push(client: httpx.AsyncClient, push_token: str, payload: Dict[str, Any], app_id: str, api_key: str):
    """Envia uma notificação push via OneSignal."""
    headers = {
        "Authorization": f"Basic {api_key}",
        "Content-Type": "application/json"
    }
    json_payload = {
        "app_id": app_id,
        "include_player_ids": [push_token],
        "headings": {"en": payload.get("headline", "Novo Caso Disponível")},
        "contents": {"en": payload.get("summary", "Um novo caso compatível com seu perfil está disponível.")},
        "data": payload
    }
    
    try:
        response = await client.post("https://onesignal.com/api/v1/notifications", headers=headers, json=json_payload)
        response.raise_for_status()
        logger.info(f"Push enviado para token {push_token[:10]}...: {response.status_code}")
    except httpx.HTTPStatusError as e:
        logger.error(f"Erro na API OneSignal para token {push_token[:10]}...: {e.response.text}")


async def _send_email_notification(supabase: Client, email: str, payload: Dict[str, Any]):
    """Envia e-mail usando SendGrid como fallback quando Push não está disponível."""
    sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("SENDGRID_FROM_EMAIL", "no-reply@litgo.com")

    if not sendgrid_api_key:
        logger.error("SENDGRID_API_KEY não configurada – e-mail não enviado.")
        return

    subject = payload.get("headline", "Novo caso disponível na LITGO")
    content_text = payload.get("summary", "Um novo caso está disponível para você.")

    message = Mail(
        from_email=from_email,
        to_emails=email,
        subject=subject,
        plain_text_content=content_text,
    )

    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, SendGridAPIClient(sendgrid_api_key).send, message)
        logger.info(f"E-mail enviado para {email}")
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail para {email}: {e}") 