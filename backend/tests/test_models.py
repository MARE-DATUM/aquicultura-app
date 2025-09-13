"""
Testes para os modelos do banco de dados
"""
import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.projeto import Projeto
from app.models.indicador import Indicador
from app.models.licenciamento import Licenciamento
from app.models.eixo_5w2h import Eixo5W2H
from app.models.provincia import Provincia
from app.models.audit_log import AuditLog

def test_user_model(db_session: Session, test_user_data):
    """Testa criação e validação do modelo User"""
    user = User(**test_user_data)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    assert user.id is not None
    assert user.email == test_user_data["email"]
    assert user.full_name == test_user_data["full_name"]
    assert user.role == test_user_data["role"]
    assert user.is_active is True

def test_projeto_model(db_session: Session, test_projeto_data):
    """Testa criação e validação do modelo Projeto"""
    # Primeiro criar uma província
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
    db_session.refresh(projeto)
    
    assert projeto.id is not None
    assert projeto.nome == test_projeto_data["nome"]
    assert projeto.tipo == test_projeto_data["tipo"]
    assert projeto.orcamento_previsto_kz == test_projeto_data["orcamento_previsto_kz"]

def test_indicador_model(db_session: Session, test_projeto_data):
    """Testa criação e validação do modelo Indicador"""
    # Criar província e projeto
    provincia = Provincia(nome="Luanda")
    db_session.add(provincia)
    db_session.commit()
    db_session.refresh(provincia)
    
    projeto_data = test_projeto_data.copy()
    projeto_data["provincia_id"] = provincia.id
    projeto = Projeto(**projeto_data)
    db_session.add(projeto)
    db_session.commit()
    db_session.refresh(projeto)
    
    # Criar indicador
    indicador_data = {
        "projeto_id": projeto.id,
        "nome": "Produção de Peixe",
        "unidade": "toneladas",
        "meta": 100,
        "valor_actual": 50,
        "periodo_referencia": "T1",
        "fonte_dados": "Relatório mensal"
    }
    
    indicador = Indicador(**indicador_data)
    db_session.add(indicador)
    db_session.commit()
    db_session.refresh(indicador)
    
    assert indicador.id is not None
    assert indicador.nome == indicador_data["nome"]
    assert indicador.meta == indicador_data["meta"]
    assert indicador.valor_actual == indicador_data["valor_actual"]

def test_licenciamento_model(db_session: Session, test_projeto_data):
    """Testa criação e validação do modelo Licenciamento"""
    # Criar província e projeto
    provincia = Provincia(nome="Luanda")
    db_session.add(provincia)
    db_session.commit()
    db_session.refresh(provincia)
    
    projeto_data = test_projeto_data.copy()
    projeto_data["provincia_id"] = provincia.id
    projeto = Projeto(**projeto_data)
    db_session.add(projeto)
    db_session.commit()
    db_session.refresh(projeto)
    
    # Criar licenciamento
    licenciamento_data = {
        "projeto_id": projeto.id,
        "status": "PENDENTE",
        "entidade_responsavel": "IPA",
        "data_submissao": "2024-01-01",
        "observacoes": "Licenciamento de teste"
    }
    
    licenciamento = Licenciamento(**licenciamento_data)
    db_session.add(licenciamento)
    db_session.commit()
    db_session.refresh(licenciamento)
    
    assert licenciamento.id is not None
    assert licenciamento.status == licenciamento_data["status"]
    assert licenciamento.entidade_responsavel == licenciamento_data["entidade_responsavel"]

def test_eixo_5w2h_model(db_session: Session, test_projeto_data):
    """Testa criação e validação do modelo Eixo5W2H"""
    # Criar província e projeto
    provincia = Provincia(nome="Luanda")
    db_session.add(provincia)
    db_session.commit()
    db_session.refresh(provincia)
    
    projeto_data = test_projeto_data.copy()
    projeto_data["provincia_id"] = provincia.id
    projeto = Projeto(**projeto_data)
    db_session.add(projeto)
    db_session.commit()
    db_session.refresh(projeto)
    
    # Criar eixo 5W2H
    eixo_data = {
        "projeto_id": projeto.id,
        "what": "Produção de peixe",
        "why": "Melhorar segurança alimentar",
        "where": "Luanda",
        "when": "2024",
        "who": "Comunidade local",
        "how": "Piscicultura",
        "how_much_kz": 500000,
        "periodo": "0-6"
    }
    
    eixo = Eixo5W2H(**eixo_data)
    db_session.add(eixo)
    db_session.commit()
    db_session.refresh(eixo)
    
    assert eixo.id is not None
    assert eixo.what == eixo_data["what"]
    assert eixo.why == eixo_data["why"]
    assert eixo.how_much_kz == eixo_data["how_much_kz"]

def test_audit_log_model(db_session: Session, test_user_data):
    """Testa criação e validação do modelo AuditLog"""
    # Criar utilizador
    user = User(**test_user_data)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Criar log de auditoria
    audit_data = {
        "user_id": user.id,
        "acao": "LOGIN",
        "entidade": "User",
        "entidade_id": user.id,
        "ip": "127.0.0.1",
        "detalhes": "Login realizado com sucesso"
    }
    
    audit_log = AuditLog(**audit_data)
    db_session.add(audit_log)
    db_session.commit()
    db_session.refresh(audit_log)
    
    assert audit_log.id is not None
    assert audit_log.user_id == user.id
    assert audit_log.acao == audit_data["acao"]
    assert audit_log.entidade == audit_data["entidade"]
