#!/usr/bin/env python3
"""
Script para testar diferentes combinações de login
"""
import requests
import json

def test_login(email, password):
    """Testa login com credenciais específicas"""
    try:
        login_data = {
            "email": email,
            "password": password
        }
        
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json=login_data
        )
        
        print(f"📧 Email: {email}")
        print(f"🔐 Password: {password}")
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"✅ Login bem-sucedido!")
            print(f"🎫 Token: {token_data.get('access_token', '')[:50]}...")
            return token_data.get('access_token')
        else:
            print(f"❌ Erro: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return None

def main():
    """Função principal"""
    print("🧪 Testando diferentes combinações de login...\n")
    
    # Combinações para testar
    combinations = [
        ("admin@aquicultura.ao", "admin123"),
        ("admin@aquicultura.ao", "123456"),
        ("admin@aquicultura.ao", "admin"),
        ("admin@admin.com", "admin123"),
        ("admin", "admin123"),
    ]
    
    for email, password in combinations:
        print("-" * 50)
        token = test_login(email, password)
        if token:
            print("🎉 Encontrou credenciais válidas!")
            break
        print()

if __name__ == "__main__":
    main()
