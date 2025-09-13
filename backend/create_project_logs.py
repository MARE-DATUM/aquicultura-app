#!/usr/bin/env python3
"""
Script para criar logs de auditoria específicos para projetos
"""
import sys
import os
sys.path.append('/Users/marconadas/aquicultura-app/backend')

from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

# Configurar conexão com o banco
DATABASE_URL = "sqlite:///./aquicultura.db"
engine = create_engine(DATABASE_URL)

def create_project_audit_logs():
    """Cria logs de auditoria específicos para projetos"""
    try:
        with engine.connect() as conn:
            # Inserir logs de projetos
            logs_data = [
                {
                    "acao": "CREATE",
                    "entidade": "Projeto",
                    "entidade_id": 1,
                    "detalhes": "Created project 'Aquicultura Comunitária - Luanda'",
                    "timestamp": datetime.utcnow() - timedelta(days=5)
                },
                {
                    "acao": "UPDATE",
                    "entidade": "Projeto",
                    "entidade_id": 1,
                    "detalhes": "Updated project 'Aquicultura Comunitária - Luanda' - Changes: Status changed from PLANEADO to EM_EXECUCAO",
                    "timestamp": datetime.utcnow() - timedelta(days=4)
                },
                {
                    "acao": "STATUS_CHANGE",
                    "entidade": "Projeto",
                    "entidade_id": 1,
                    "detalhes": "Project status changed from EM_EXECUCAO to CONCLUIDO - Observations: Projeto finalizado com sucesso",
                    "timestamp": datetime.utcnow() - timedelta(days=3)
                },
                {
                    "acao": "CREATE",
                    "entidade": "Projeto",
                    "entidade_id": 2,
                    "detalhes": "Created project 'Piscicultura Empresarial - Benguela'",
                    "timestamp": datetime.utcnow() - timedelta(days=2)
                },
                {
                    "acao": "UPDATE",
                    "entidade": "Projeto",
                    "entidade_id": 2,
                    "detalhes": "Updated project 'Piscicultura Empresarial - Benguela' - Changes: Budget changed from 500000.0 to 750000.0",
                    "timestamp": datetime.utcnow() - timedelta(days=1)
                },
                {
                    "acao": "IMPORT",
                    "entidade": "Projeto",
                    "entidade_id": None,
                    "detalhes": "Bulk import completed: 5 successful, 0 errors",
                    "timestamp": datetime.utcnow() - timedelta(hours=12)
                },
                {
                    "acao": "EXPORT",
                    "entidade": "Projeto",
                    "entidade_id": None,
                    "detalhes": "Exported 10 projects",
                    "timestamp": datetime.utcnow() - timedelta(hours=6)
                },
                {
                    "acao": "DELETE",
                    "entidade": "Projeto",
                    "entidade_id": 3,
                    "detalhes": "Deleted project 'Projeto Teste'",
                    "timestamp": datetime.utcnow() - timedelta(hours=2)
                }
            ]
            
            # Inserir logs
            for log in logs_data:
                conn.execute(text("""
                    INSERT INTO audit_logs (acao, entidade, entidade_id, detalhes, timestamp)
                    VALUES (:acao, :entidade, :entidade_id, :detalhes, :timestamp)
                """), log)
            
            conn.commit()
            print(f"✅ Criados {len(logs_data)} logs de auditoria para projetos!")
            
            # Verificar total
            result = conn.execute(text("SELECT COUNT(*) FROM audit_logs;"))
            total = result.fetchone()[0]
            print(f"📊 Total de logs no banco: {total}")
            
            # Mostrar logs de projetos
            result = conn.execute(text("""
                SELECT id, acao, entidade, detalhes, timestamp 
                FROM audit_logs 
                WHERE entidade = 'Projeto'
                ORDER BY timestamp DESC
            """))
            
            print("\n📋 Logs de projetos:")
            for row in result:
                print(f"  ID: {row[0]} | Ação: {row[1]} | Detalhes: {row[3][:60]}... | Data: {row[4]}")
                
    except Exception as e:
        print(f"❌ Erro ao criar logs: {e}")

if __name__ == "__main__":
    create_project_audit_logs()
