# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from prometheus_fastapi_instrumentator import Instrumentator

from backend.main_routes import router as api_router
from backend.routes.offers import router as offers_router
from backend.routes.contracts import router as contracts_router
from backend.routes.reviews import router as reviews_router
from backend.routes.webhooks import router as webhooks_router

# --- Configuração do Rate Limiting ---
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="LITGO API",
    description="API para o sistema de match jurídico inteligente.",
    version="1.0.0",
)

# Adiciona os middlewares na aplicação
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Configuração do CORS ---
# Configuração dinâmica baseada no ambiente
if os.getenv("ENVIRONMENT") == "production":
    origins = [
        os.getenv("FRONTEND_URL", "https://app.litgo.com"),
    ]
else:
    origins = [
        "http://localhost",
        "http://localhost:8081",  # Porta padrão do Expo Go
        "http://localhost:3000",  # Porta padrão de apps React
        "http://127.0.0.1:8081",  # Variação local
        "http://127.0.0.1:3000",  # Variação local
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"] if os.getenv("ENVIRONMENT") == "production" else ["*"],
    allow_headers=["*"],
)

# --- Instrumentação para Prometheus ---
Instrumentator().instrument(app).expose(app)

# --- Inclusão das Rotas ---
app.include_router(api_router, prefix="/api")
app.include_router(offers_router, prefix="/api")
app.include_router(contracts_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(webhooks_router)

# CORREÇÃO: Rate limiter aplicado individualmente nas rotas em routes.py
# Removido limiter.limit("60/minute")(api_router) que causava erro nos testes

@app.get("/", tags=["Root"])
async def read_root():
    """Endpoint raiz para verificar o status da API."""
    return {"status": "ok", "message": "Bem-vindo à API LITGO!"}
