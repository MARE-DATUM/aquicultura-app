"""
Testes para as APIs
"""
import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.provincia import Provincia
from app.core.security import get_password_hash

class TestAuthAPI:
    """Testes para API de autenticação"""
    
    def test_login_success(self, client: TestClient, db_session, test_user_data):
        """Testa login bem-sucedido"""
        # Criar utilizador
        user_data = test_user_data.copy()
        user_data["password"] = get_password_hash(user_data["password"])
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        
        # Testar login
        response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": "testpassword123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert "refresh_token" in data
    
    def test_login_invalid_credentials(self, client: TestClient):
        """Testa login com credenciais inválidas"""
        response = client.post("/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client: TestClient, db_session, test_user_data):
        """Testa obtenção do utilizador atual"""
        # Criar utilizador
        user_data = test_user_data.copy()
        user_data["password"] = get_password_hash(user_data["password"])
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        
        # Fazer login
        login_response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": "testpassword123"
        })
        token = login_response.json()["access_token"]
        
        # Obter utilizador atual
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]

class TestUsersAPI:
    """Testes para API de utilizadores"""
    
    def test_get_users(self, client: TestClient, db_session, test_user_data):
        """Testa listagem de utilizadores"""
        # Criar utilizador
        user_data = test_user_data.copy()
        user_data["password"] = get_password_hash(user_data["password"])
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        
        # Fazer login como ROOT
        user.role = "ROOT"
        db_session.commit()
        
        login_response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": "testpassword123"
        })
        token = login_response.json()["access_token"]
        
        # Listar utilizadores
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/users", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["email"] == test_user_data["email"]
    
    def test_create_user(self, client: TestClient, db_session, test_user_data):
        """Testa criação de utilizador"""
        # Criar utilizador ROOT
        user_data = test_user_data.copy()
        user_data["password"] = get_password_hash(user_data["password"])
        user_data["role"] = "ROOT"
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        
        # Fazer login
        login_response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": "testpassword123"
        })
        token = login_response.json()["access_token"]
        
        # Criar novo utilizador
        new_user_data = {
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "newpassword123",
            "role": "VISUALIZACAO"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/users", json=new_user_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == new_user_data["email"]
        assert data["full_name"] == new_user_data["full_name"]

class TestProjetosAPI:
    """Testes para API de projetos"""
    
    def test_get_projetos(self, client: TestClient, db_session, test_user_data, test_projeto_data):
        """Testa listagem de projetos"""
        # Criar utilizador
        user_data = test_user_data.copy()
        user_data["password"] = get_password_hash(user_data["password"])
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        
        # Criar província
        provincia = Provincia(nome="Luanda")
        db_session.add(provincia)
        db_session.commit()
        db_session.refresh(provincia)
        
        # Criar projeto
        projeto_data = test_projeto_data.copy()
        projeto_data["provincia_id"] = provincia.id
        projeto = Projeto(**projeto_data)
        db_session.add(projeto)
        db_session.commit()
        
        # Fazer login
        login_response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": "testpassword123"
        })
        token = login_response.json()["access_token"]
        
        # Listar projetos
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/projetos", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["nome"] == test_projeto_data["nome"]
    
    def test_create_projeto(self, client: TestClient, db_session, test_user_data, test_projeto_data):
        """Testa criação de projeto"""
        # Criar utilizador
        user_data = test_user_data.copy()
        user_data["password"] = get_password_hash(user_data["password"])
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        
        # Criar província
        provincia = Provincia(nome="Luanda")
        db_session.add(provincia)
        db_session.commit()
        db_session.refresh(provincia)
        
        # Fazer login
        login_response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": "testpassword123"
        })
        token = login_response.json()["access_token"]
        
        # Criar projeto
        projeto_data = test_projeto_data.copy()
        projeto_data["provincia_id"] = provincia.id
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/projetos", json=projeto_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["nome"] == projeto_data["nome"]
        assert data["provincia_id"] == provincia.id

class TestDashboardAPI:
    """Testes para API do dashboard"""
    
    def test_get_dashboard_stats(self, client: TestClient, db_session, test_user_data):
        """Testa obtenção de estatísticas do dashboard"""
        # Criar utilizador
        user_data = test_user_data.copy()
        user_data["password"] = get_password_hash(user_data["password"])
        user = User(**user_data)
        db_session.add(user)
        db_session.commit()
        
        # Fazer login
        login_response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": "testpassword123"
        })
        token = login_response.json()["access_token"]
        
        # Obter estatísticas
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/dashboard/stats", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "projetos" in data
        assert "indicadores" in data
        assert "licenciamentos" in data
        assert "mapa" in data
