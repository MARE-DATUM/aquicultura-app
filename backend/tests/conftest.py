"""
Configuração de fixtures para testes
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import get_db, Base
from app.core.config import settings

# Database de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    """Cria engine de banco de dados para testes"""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    """Cria sessão de banco de dados para cada teste"""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Cria cliente de teste FastAPI"""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_data():
    """Dados de teste para utilizador"""
    return {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "testpassword123",
        "role": "VISUALIZACAO"
    }

@pytest.fixture
def test_projeto_data():
    """Dados de teste para projeto"""
    return {
        "nome": "Projeto Teste",
        "provincia_id": 1,
        "tipo": "COMUNITARIO",
        "fonte_financiamento": "AFAP-2",
        "estado": "PLANEADO",
        "responsavel": "Responsável Teste",
        "orcamento_previsto_kz": 1000000,
        "orcamento_executado_kz": 0,
        "data_inicio_prevista": "2024-01-01",
        "data_fim_prevista": "2024-12-31",
        "descricao": "Projeto de teste"
    }
