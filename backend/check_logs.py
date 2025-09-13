#!/usr/bin/env python3
"""
Script para verificar logs de auditoria no banco de dados
"""
import sys
import os
sys.path.append('/Users/marconadas/aquicultura-app/backend')

from sqlalchemy import create_engine, text
from datetime import datetime

# Configurar conexão com o banco
DATABASE_URL = "sqlite:///./aquicultura.db"
engine = create_engine(DATABASE_URL)

def check_audit_logs():
    """Verifica logs de auditoria no banco"""
    try:
        with engine.connect() as conn:
            # Verificar se a tabela existe
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs';"))
            tables = result.fetchall()
            
            if not tables:
                print("❌ Tabela audit_logs não encontrada!")
                return
            
            print("✅ Tabela audit_logs encontrada!")
            
            # Contar logs
            result = conn.execute(text("SELECT COUNT(*) FROM audit_logs;"))
            count = result.fetchone()[0]
            print(f"📊 Total de logs: {count}")
            
            if count > 0:
                # Mostrar últimos logs
                result = conn.execute(text("""
                    SELECT id, acao, entidade, detalhes, timestamp 
                    FROM audit_logs 
                    ORDER BY timestamp DESC 
                    LIMIT 5
                """))
                
                print("\n📋 Últimos 5 logs:")
                for row in result:
                    print(f"  ID: {row[0]} | Ação: {row[1]} | Entidade: {row[2]} | Detalhes: {row[3][:50]}... | Data: {row[4]}")
            else:
                print("⚠️ Nenhum log encontrado no banco.")
                
    except Exception as e:
        print(f"❌ Erro ao verificar logs: {e}")

if __name__ == "__main__":
    check_audit_logs()
