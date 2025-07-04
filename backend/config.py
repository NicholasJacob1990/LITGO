"""
Configurações do backend LITGO5
"""
import os
from typing import Optional

class Settings:
    """
    Classe de configurações centralizadas
    """
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # DocuSign
    USE_DOCUSIGN: bool = os.getenv("USE_DOCUSIGN", "false").lower() == "true"
    DOCUSIGN_BASE_URL: str = os.getenv("DOCUSIGN_BASE_URL", "https://demo.docusign.net")
    DOCUSIGN_API_KEY: str = os.getenv("DOCUSIGN_API_KEY", "")
    DOCUSIGN_ACCOUNT_ID: str = os.getenv("DOCUSIGN_ACCOUNT_ID", "")
    DOCUSIGN_USER_ID: str = os.getenv("DOCUSIGN_USER_ID", "")
    DOCUSIGN_PRIVATE_KEY: str = os.getenv("DOCUSIGN_PRIVATE_KEY", "")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Anthropic
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379")
    
    # Ambiente
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Jusbrasil
    JUSBRASIL_API_URL: str = os.getenv("JUSBRASIL_API_URL", "")
    JUSBRASIL_API_TOKEN: str = os.getenv("JUSBRASIL_API_TOKEN", "")
    
    @classmethod
    def validate_docusign_config(cls) -> bool:
        """
        Valida se as configurações DocuSign estão completas
        """
        if not cls.USE_DOCUSIGN:
            return True
            
        required_fields = [
            cls.DOCUSIGN_API_KEY,
            cls.DOCUSIGN_ACCOUNT_ID,
            cls.DOCUSIGN_USER_ID,
            cls.DOCUSIGN_PRIVATE_KEY
        ]
        
        return all(field.strip() for field in required_fields)
    
    @classmethod
    def get_docusign_auth_url(cls) -> str:
        """
        Retorna URL de autorização DocuSign
        """
        if cls.ENVIRONMENT == "production":
            return "https://account.docusign.com"
        else:
            return "https://account-d.docusign.com"

# Instância global das configurações
settings = Settings() 