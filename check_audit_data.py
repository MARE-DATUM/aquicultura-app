#!/usr/bin/env python3
"""
Script para verificar e popular dados de auditoria
"""
import sqlite3
import sys
from datetime import datetime, timedelta
import random

def check_audit_data():
    """Verifica dados na tabela de auditoria"""
    try:
        # Conectar ao banco de dados
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Verificar se a tabela existe
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='audit_logs'
        """)
        
        if not cursor.fetchone():
            print("❌ Tabela 'audit_logs' não existe!")
            return False
            
        # Contar registros
        cursor.execute("SELECT COUNT(*) FROM audit_logs")
        count = cursor.fetchone()[0]
        
        print(f"📊 Total de logs de auditoria: {count}")
        
        if count == 0:
            print("⚠️  Não há dados de auditoria!")
            return False
            
        # Mostrar alguns exemplos
        cursor.execute("""
            SELECT id, user_id, acao, entidade, timestamp 
            FROM audit_logs 
            ORDER BY timestamp DESC 
            LIMIT 5
        """)
        
        logs = cursor.fetchall()
        print("\n📋 Últimos 5 logs:")
        for log in logs:
            print(f"  ID: {log[0]}, User: {log[1]}, Ação: {log[2]}, Entidade: {log[3]}, Data: {log[4]}")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro ao verificar dados: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def create_sample_audit_data():
    """Cria dados de exemplo para auditoria"""
    try:
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Verificar se há usuários
        cursor.execute("SELECT id FROM users LIMIT 5")
        users = cursor.fetchall()
        
        if not users:
            print("⚠️  Não há usuários no sistema. Criando logs sem usuário...")
            user_ids = [None] * 10
        else:
            user_ids = [user[0] for user in users] * 2  # Duplicar para ter mais opções
        
        # Ações possíveis
        acoes = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT']
        entidades = ['Projeto', 'Indicador', 'Licenciamento', 'Eixo5W2H', 'User']
        
        # Criar 20 logs de exemplo
        sample_logs = []
        base_time = datetime.now() - timedelta(days=30)
        
        for i in range(20):
            log_time = base_time + timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            user_id = random.choice(user_ids) if user_ids[0] is not None else None
            acao = random.choice(acoes)
            entidade = random.choice(entidades) if random.random() > 0.2 else None
            entidade_id = random.randint(1, 100) if entidade else None
            ip = f"192.168.1.{random.randint(1, 254)}"
            detalhes = f"Ação {acao} executada na entidade {entidade}" if entidade else f"Ação {acao} executada"
            
            sample_logs.append((
                user_id, None, acao, entidade, entidade_id, ip, log_time.isoformat(), detalhes
            ))
        
        # Inserir logs
        cursor.executemany("""
            INSERT INTO audit_logs 
            (user_id, papel, acao, entidade, entidade_id, ip, timestamp, detalhes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_logs)
        
        conn.commit()
        print(f"✅ Criados {len(sample_logs)} logs de auditoria de exemplo!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar dados de exemplo: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Função principal"""
    print("🔍 Verificando dados de auditoria...")
    
    if not check_audit_data():
        print("\n🔧 Criando dados de exemplo...")
        if create_sample_audit_data():
            print("\n✅ Dados criados! Verificando novamente...")
            check_audit_data()
        else:
            print("❌ Falha ao criar dados de exemplo")
            sys.exit(1)
    else:
        print("✅ Dados de auditoria encontrados!")

if __name__ == "__main__":
    main()
