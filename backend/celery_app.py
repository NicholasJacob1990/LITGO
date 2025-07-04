# backend/celery_app.py
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# Define a URL do Redis. Padrão para localhost se não estiver definida.
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Cria a instância do Celery
celery_app = Celery(
    "tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["backend.tasks"] # Aponta para o módulo onde as tarefas estão definidas
)

# Configurações opcionais
celery_app.conf.update(
    task_track_started=True,
    result_expires=3600, # Os resultados das tarefas expiram em 1 hora
)

if __name__ == "__main__":
    celery_app.start() 