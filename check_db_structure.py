#!/usr/bin/env python3
"""
Script para verificar estrutura do banco
"""
import sqlite3

def check_table_structure(table_name):
    """Verifica estrutura de uma tabela"""
    try:
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Verificar se a tabela existe
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name=?
        """, (table_name,))
        
        if not cursor.fetchone():
            print(f"❌ Tabela '{table_name}' não existe!")
            return False
        
        # Obter estrutura da tabela
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        print(f"📋 Estrutura da tabela '{table_name}':")
        for col in columns:
            print(f"  {col[1]} ({col[2]}) - PK: {col[5]}, NOT NULL: {col[3]}")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro ao verificar estrutura: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def check_users_data():
    """Verifica dados dos usuários"""
    try:
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Verificar usuários
        cursor.execute("SELECT * FROM users LIMIT 5")
        users = cursor.fetchall()
        
        print(f"👥 Usuários encontrados: {len(users)}")
        for user in users:
            print(f"  {user}")
            
        return users
        
    except Exception as e:
        print(f"❌ Erro ao verificar usuários: {e}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Função principal"""
    print("🔍 Verificando estrutura do banco de dados...")
    
    # Verificar tabelas principais
    tables = ['users', 'audit_logs', 'projetos', 'indicadores']
    
    for table in tables:
        print(f"\n📊 Tabela: {table}")
        check_table_structure(table)
    
    print("\n" + "="*50)
    check_users_data()

if __name__ == "__main__":
    main()
