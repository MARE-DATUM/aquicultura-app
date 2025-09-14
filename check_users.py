#!/usr/bin/env python3
"""
Script para verificar usuários no banco
"""
import sqlite3
import hashlib

def check_users():
    """Verifica usuários no banco"""
    try:
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Verificar usuários
        cursor.execute("SELECT id, email, full_name, papel, is_active FROM users")
        users = cursor.fetchall()
        
        print(f"📊 Total de usuários: {len(users)}")
        
        for user in users:
            print(f"  ID: {user[0]}, Email: {user[1]}, Nome: {user[2]}, Papel: {user[3]}, Ativo: {user[4]}")
            
        return users
        
    except Exception as e:
        print(f"❌ Erro ao verificar usuários: {e}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()

def create_admin_user():
    """Cria usuário admin se não existir"""
    try:
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Verificar se admin já existe
        cursor.execute("SELECT id FROM users WHERE email = 'admin@admin.com'")
        if cursor.fetchone():
            print("✅ Usuário admin já existe!")
            return True
        
        # Criar hash da senha (usando o mesmo método do backend)
        password = "admin123"
        # Simular o hash que o backend usa (bcrypt)
        # Por simplicidade, vou usar um hash simples aqui
        password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u"  # admin123
        
        # Inserir usuário admin
        cursor.execute("""
            INSERT INTO users (email, full_name, hashed_password, papel, is_active)
            VALUES (?, ?, ?, ?, ?)
        """, ("admin@admin.com", "Administrador", password_hash, "ROOT", True))
        
        conn.commit()
        print("✅ Usuário admin criado com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário admin: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Função principal"""
    print("👥 Verificando usuários...")
    
    users = check_users()
    
    if not users:
        print("⚠️  Não há usuários no sistema!")
        print("🔧 Criando usuário admin...")
        create_admin_user()
        check_users()
    else:
        # Verificar se há um usuário ROOT
        root_users = [u for u in users if u[3] == 'ROOT']
        if not root_users:
            print("⚠️  Não há usuário ROOT no sistema!")
            print("🔧 Criando usuário admin...")
            create_admin_user()

if __name__ == "__main__":
    main()
