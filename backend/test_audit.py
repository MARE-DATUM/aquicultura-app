#!/usr/bin/env python3
"""
Script para testar a funcionalidade de auditoria dos projetos
"""
import sys
import os
sys.path.append('/Users/marconadas/aquicultura-app/backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.audit_log import AuditLog, AcaoAudit
from app.models.user import User
from app.models.projeto import Projeto, EstadoProjeto, TipoProjeto, FonteFinanciamento
from datetime import datetime, timedelta
import random

# Configurar conexão com o banco
DATABASE_URL = "sqlite:///./aquicultura.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_audit_logs():
    """Cria logs de auditoria de teste para projetos"""
    db = SessionLocal()
    
    try:
        # Verificar se já existem logs
        existing_logs = db.query(AuditLog).count()
        if existing_logs > 0:
            print(f"Já existem {existing_logs} logs de auditoria no banco.")
            return
        
        # Criar alguns logs de auditoria de teste
        test_logs = [
            {
                "acao": AcaoAudit.CREATE,
                "entidade": "Projeto",
                "entidade_id": 1,
                "detalhes": "Created project 'Aquicultura Comunitária - Luanda'",
                "timestamp": datetime.utcnow() - timedelta(days=5)
            },
            {
                "acao": AcaoAudit.UPDATE,
                "entidade": "Projeto",
                "entidade_id": 1,
                "detalhes": "Updated project 'Aquicultura Comunitária - Luanda' - Changes: Status changed from PLANEADO to EM_EXECUCAO",
                "timestamp": datetime.utcnow() - timedelta(days=4)
            },
            {
                "acao": AcaoAudit.STATUS_CHANGE,
                "entidade": "Projeto",
                "entidade_id": 1,
                "detalhes": "Project status changed from EM_EXECUCAO to CONCLUIDO - Observations: Projeto finalizado com sucesso",
                "timestamp": datetime.utcnow() - timedelta(days=3)
            },
            {
                "acao": AcaoAudit.CREATE,
                "entidade": "Projeto",
                "entidade_id": 2,
                "detalhes": "Created project 'Piscicultura Empresarial - Benguela'",
                "timestamp": datetime.utcnow() - timedelta(days=2)
            },
            {
                "acao": AcaoAudit.UPDATE,
                "entidade": "Projeto",
                "entidade_id": 2,
                "detalhes": "Updated project 'Piscicultura Empresarial - Benguela' - Changes: Budget changed from 500000.0 to 750000.0",
                "timestamp": datetime.utcnow() - timedelta(days=1)
            },
            {
                "acao": AcaoAudit.IMPORT,
                "entidade": "Projeto",
                "entidade_id": None,
                "detalhes": "Bulk import completed: 5 successful, 0 errors",
                "timestamp": datetime.utcnow() - timedelta(hours=12)
            },
            {
                "acao": AcaoAudit.EXPORT,
                "entidade": "Projeto",
                "entidade_id": None,
                "detalhes": "Exported 10 projects",
                "timestamp": datetime.utcnow() - timedelta(hours=6)
            },
            {
                "acao": AcaoAudit.DELETE,
                "entidade": "Projeto",
                "entidade_id": 3,
                "detalhes": "Deleted project 'Projeto Teste'",
                "timestamp": datetime.utcnow() - timedelta(hours=2)
            }
        ]
        
        # Inserir logs no banco
        for log_data in test_logs:
            audit_log = AuditLog(**log_data)
            db.add(audit_log)
        
        db.commit()
        print(f"✅ Criados {len(test_logs)} logs de auditoria de teste!")
        
        # Verificar se foram inseridos
        total_logs = db.query(AuditLog).count()
        print(f"📊 Total de logs no banco: {total_logs}")
        
        # Mostrar alguns logs
        recent_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(3).all()
        print("\n📋 Últimos logs criados:")
        for log in recent_logs:
            print(f"  - {log.acao.value}: {log.detalhes}")
        
    except Exception as e:
        print(f"❌ Erro ao criar logs de teste: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_audit_logs()
