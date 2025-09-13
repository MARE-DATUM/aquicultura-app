"""
Testes para os serviços
"""
import pytest
from sqlalchemy.orm import Session
from app.services.user_service import UserService
from app.services.projeto_service import ProjetoService
from app.services.indicador_service import IndicadorService
from app.services.licenciamento_service import LicenciamentoService
from app.services.audit_service import AuditService
from app.models.user import User
from app.models.projeto import Projeto
from app.models.provincia import Provincia
from app.models.indicador import Indicador
from app.models.licenciamento import Licenciamento
from app.models.audit_log import AuditLog

class TestUserService:
    """Testes para UserService"""
    
    def test_create_user(self, db_session: Session, test_user_data):
        """Testa criação de utilizador"""
        user_service = UserService(db_session)
        user = user_service.create_user(test_user_data)
        
        assert user.id is not None
        assert user.email == test_user_data["email"]
        assert user.full_name == test_user_data["full_name"]
        assert user.role == test_user_data["role"]
    
    def test_get_user_by_id(self, db_session: Session, test_user_data):
        """Testa busca de utilizador por ID"""
        user_service = UserService(db_session)
        created_user = user_service.create_user(test_user_data)
        
        found_user = user_service.get_user_by_id(created_user.id)
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == created_user.email
    
    def test_get_user_by_email(self, db_session: Session, test_user_data):
        """Testa busca de utilizador por email"""
        user_service = UserService(db_session)
        created_user = user_service.create_user(test_user_data)
        
        found_user = user_service.get_user_by_email(created_user.email)
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == created_user.email
    
    def test_update_user(self, db_session: Session, test_user_data):
        """Testa atualização de utilizador"""
        user_service = UserService(db_session)
        created_user = user_service.create_user(test_user_data)
        
        update_data = {"full_name": "Nome Atualizado"}
        updated_user = user_service.update_user(created_user.id, update_data)
        
        assert updated_user.full_name == "Nome Atualizado"
        assert updated_user.email == created_user.email
    
    def test_delete_user(self, db_session: Session, test_user_data):
        """Testa exclusão de utilizador"""
        user_service = UserService(db_session)
        created_user = user_service.create_user(test_user_data)
        
        user_service.delete_user(created_user.id)
        
        found_user = user_service.get_user_by_id(created_user.id)
        assert found_user is None

class TestProjetoService:
    """Testes para ProjetoService"""
    
    def test_create_projeto(self, db_session: Session, test_projeto_data):
        """Testa criação de projeto"""
        # Criar província
        provincia = Provincia(nome="Luanda")
        db_session.add(provincia)
        db_session.commit()
        db_session.refresh(provincia)
        
        projeto_service = ProjetoService(db_session)
        projeto_data = test_projeto_data.copy()
        projeto_data["provincia_id"] = provincia.id
        
        projeto = projeto_service.create_projeto(projeto_data)
        
        assert projeto.id is not None
        assert projeto.nome == projeto_data["nome"]
        assert projeto.tipo == projeto_data["tipo"]
        assert projeto.provincia_id == provincia.id
    
    def test_get_projetos_with_filters(self, db_session: Session, test_projeto_data):
        """Testa busca de projetos com filtros"""
        # Criar província
        provincia = Provincia(nome="Luanda")
        db_session.add(provincia)
        db_session.commit()
        db_session.refresh(provincia)
        
        projeto_service = ProjetoService(db_session)
        projeto_data = test_projeto_data.copy()
        projeto_data["provincia_id"] = provincia.id
        
        # Criar dois projetos
        projeto1 = projeto_service.create_projeto(projeto_data)
        projeto2_data = projeto_data.copy()
        projeto2_data["nome"] = "Projeto 2"
        projeto2_data["tipo"] = "EMPRESARIAL"
        projeto2 = projeto_service.create_projeto(projeto2_data)
        
        # Testar filtro por tipo
        projetos_comunitarios = projeto_service.get_projetos(tipo="COMUNITARIO")
        assert len(projetos_comunitarios) == 1
        assert projetos_comunitarios[0].id == projeto1.id
        
        # Testar filtro por província
        projetos_luanda = projeto_service.get_projetos(provincia_id=provincia.id)
        assert len(projetos_luanda) == 2

class TestIndicadorService:
    """Testes para IndicadorService"""
    
    def test_create_indicador(self, db_session: Session, test_projeto_data):
        """Testa criação de indicador"""
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
        
        indicador_service = IndicadorService(db_session)
        indicador_data = {
            "projeto_id": projeto.id,
            "nome": "Produção de Peixe",
            "unidade": "toneladas",
            "meta": 100,
            "valor_actual": 50,
            "periodo_referencia": "T1",
            "fonte_dados": "Relatório mensal"
        }
        
        indicador = indicador_service.create_indicador(indicador_data)
        
        assert indicador.id is not None
        assert indicador.nome == indicador_data["nome"]
        assert indicador.meta == indicador_data["meta"]
        assert indicador.projeto_id == projeto.id

class TestLicenciamentoService:
    """Testes para LicenciamentoService"""
    
    def test_create_licenciamento(self, db_session: Session, test_projeto_data):
        """Testa criação de licenciamento"""
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
        
        licenciamento_service = LicenciamentoService(db_session)
        licenciamento_data = {
            "projeto_id": projeto.id,
            "status": "PENDENTE",
            "entidade_responsavel": "IPA",
            "data_submissao": "2024-01-01",
            "observacoes": "Licenciamento de teste"
        }
        
        licenciamento = licenciamento_service.create_licenciamento(licenciamento_data)
        
        assert licenciamento.id is not None
        assert licenciamento.status == licenciamento_data["status"]
        assert licenciamento.projeto_id == projeto.id

class TestAuditService:
    """Testes para AuditService"""
    
    def test_create_audit_log(self, db_session: Session, test_user_data):
        """Testa criação de log de auditoria"""
        # Criar utilizador
        user = User(**test_user_data)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        audit_service = AuditService(db_session)
        audit_data = {
            "user_id": user.id,
            "acao": "LOGIN",
            "entidade": "User",
            "entidade_id": user.id,
            "ip": "127.0.0.1",
            "detalhes": "Login realizado com sucesso"
        }
        
        audit_log = audit_service.create_audit_log(audit_data)
        
        assert audit_log.id is not None
        assert audit_log.user_id == user.id
        assert audit_log.acao == audit_data["acao"]
    
    def test_get_audit_logs_with_filters(self, db_session: Session, test_user_data):
        """Testa busca de logs de auditoria com filtros"""
        # Criar utilizador
        user = User(**test_user_data)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        audit_service = AuditService(db_session)
        
        # Criar vários logs
        audit_data1 = {
            "user_id": user.id,
            "acao": "LOGIN",
            "entidade": "User",
            "entidade_id": user.id,
            "ip": "127.0.0.1"
        }
        audit_data2 = {
            "user_id": user.id,
            "acao": "LOGOUT",
            "entidade": "User",
            "entidade_id": user.id,
            "ip": "127.0.0.1"
        }
        
        audit_service.create_audit_log(audit_data1)
        audit_service.create_audit_log(audit_data2)
        
        # Testar filtro por ação
        login_logs = audit_service.get_audit_logs(acao="LOGIN")
        assert len(login_logs) == 1
        assert login_logs[0].acao == "LOGIN"
        
        # Testar filtro por utilizador
        user_logs = audit_service.get_audit_logs(user_id=user.id)
        assert len(user_logs) == 2
