"""
Testes para o endpoint de triagem assíncrona.
"""
import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.api
def test_triage_endpoint_success(client, mock_auth, mock_celery, sample_triage_request):
    """Testa endpoint de triagem com sucesso."""
    with patch('backend.routes.get_current_user', mock_auth):
        response = client.post("/api/triage", json=sample_triage_request)
        
        assert response.status_code == 202
        data = response.json()
        assert "task_id" in data
        assert data["status"] == "accepted"
        assert "triagem" in data["message"]


@pytest.mark.api
def test_triage_endpoint_unauthorized(client, sample_triage_request):
    """Testa endpoint de triagem sem autenticação."""
    response = client.post("/api/triage", json=sample_triage_request)
    assert response.status_code == 401


@pytest.mark.api
def test_triage_endpoint_invalid_payload(client, mock_auth):
    """Testa endpoint de triagem com payload inválido."""
    with patch('backend.routes.get_current_user', mock_auth):
        response = client.post("/api/triage", json={"invalid": "data"})
        assert response.status_code == 422


@pytest.mark.api
def test_triage_status_pending(client, mock_auth):
    """Testa status de triagem pendente."""
    with patch('backend.routes.get_current_user', mock_auth):
        with patch('backend.routes.AsyncResult') as mock_result:
            mock_result.return_value.ready.return_value = False
            
            response = client.get("/api/triage/status/test-task-id")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "pending"


@pytest.mark.api
def test_triage_status_completed(client, mock_auth, sample_case_data):
    """Testa status de triagem concluída."""
    with patch('backend.routes.get_current_user', mock_auth):
        with patch('backend.routes.AsyncResult') as mock_result:
            mock_result.return_value.ready.return_value = True
            mock_result.return_value.successful.return_value = True
            mock_result.return_value.get.return_value = sample_case_data
            
            response = client.get("/api/triage/status/test-task-id")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "completed"
            assert data["result"]["id"] == sample_case_data["id"]


@pytest.mark.api
def test_triage_status_failed(client, mock_auth):
    """Testa status de triagem falhada."""
    with patch('backend.routes.get_current_user', mock_auth):
        with patch('backend.routes.AsyncResult') as mock_result:
            mock_result.return_value.ready.return_value = True
            mock_result.return_value.successful.return_value = False
            mock_result.return_value.info = "Erro na análise do Claude"
            
            response = client.get("/api/triage/status/test-task-id")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "failed"
            assert "error" in data


@pytest.mark.unit
def test_triage_celery_task_dispatch(mock_celery, sample_triage_request):
    """Testa se a tarefa Celery é despachada corretamente."""
    from backend.routes import run_triage_async_task
    
    # Simular chamada da tarefa
    task = run_triage_async_task.delay(
        sample_triage_request["texto_cliente"], 
        sample_triage_request["coords"]
    )
    
    # Verificar se foi chamada
    mock_celery.delay.assert_called_once_with(
        sample_triage_request["texto_cliente"],
        sample_triage_request["coords"]
    )
    
    assert task.id == "test-task-id"


@pytest.mark.slow
@pytest.mark.integration
def test_triage_full_flow_mock(client, mock_auth, mock_celery, mock_supabase, sample_triage_request):
    """Testa fluxo completo de triagem (mockado)."""
    with patch('backend.routes.get_current_user', mock_auth):
        # 1. Iniciar triagem
        response = client.post("/api/triage", json=sample_triage_request)
        assert response.status_code == 202
        task_id = response.json()["task_id"]
        
        # 2. Verificar status (simulando processamento)
        with patch('backend.routes.AsyncResult') as mock_result:
            mock_result.return_value.ready.return_value = False
            
            response = client.get(f"/api/triage/status/{task_id}")
            assert response.status_code == 200
            assert response.json()["status"] == "pending"
        
        # 3. Verificar status concluído
        with patch('backend.routes.AsyncResult') as mock_result:
            mock_result.return_value.ready.return_value = True
            mock_result.return_value.successful.return_value = True
            mock_result.return_value.get.return_value = {
                "case_id": "test-case-123",
                "area": "Trabalhista",
                "urgency_h": 48
            }
            
            response = client.get(f"/api/triage/status/{task_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "completed"
            assert data["result"]["case_id"] == "test-case-123" 