#!/usr/bin/env python3
"""
Script para criar um token de autenticação válido diretamente no banco
"""
import sqlite3
import jwt
import json
from datetime import datetime, timedelta

def create_auth_token():
    """Cria um token de autenticação válido"""
    try:
        # Conectar ao banco
        conn = sqlite3.connect('backend/aquicultura.db')
        cursor = conn.cursor()
        
        # Obter usuário admin
        cursor.execute("SELECT id, email, full_name, role FROM users WHERE email = 'admin@aquicultura.ao'")
        user = cursor.fetchone()
        
        if not user:
            print("❌ Usuário admin não encontrado!")
            return None
        
        user_id, email, full_name, role = user
        print(f"👤 Usuário encontrado: {full_name} ({email}) - {role}")
        
        # Criar token JWT
        secret = "your-super-secret-jwt-key-change-in-production"
        now = datetime.utcnow()
        exp = now + timedelta(hours=24)  # Token válido por 24 horas
        
        payload = {
            "sub": email,
            "user_id": user_id,
            "role": role,
            "exp": int(exp.timestamp()),
            "type": "access",
            "iat": int(now.timestamp())
        }
        
        token = jwt.encode(payload, secret, algorithm="HS256")
        
        print(f"🎫 Token criado com sucesso!")
        print(f"Token: {token}")
        print(f"Expira em: {exp.isoformat()}")
        
        # Salvar token no localStorage via JavaScript
        js_code = f"""
        localStorage.setItem('access_token', '{token}');
        localStorage.setItem('refresh_token', '{token}');
        console.log('Token salvo no localStorage');
        window.location.href = '/auditoria';
        """
        
        print(f"\n📋 JavaScript para executar no browser:")
        print(js_code)
        
        return token
        
    except Exception as e:
        print(f"❌ Erro ao criar token: {e}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Função principal"""
    print("🔐 Criando token de autenticação...")
    
    token = create_auth_token()
    if token:
        print("\n✅ Token criado com sucesso!")
        print("🔄 Execute o JavaScript no browser para salvar o token")
    else:
        print("❌ Falha ao criar token")

if __name__ == "__main__":
    main()
