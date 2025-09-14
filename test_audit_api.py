#!/usr/bin/env python3
"""
Script para testar a API de auditoria
"""
import requests
import json
import sys

def get_auth_token():
    """Obtém token de autenticação"""
    try:
        # Tentar fazer login como admin
        login_data = {
            "email": "admin@aquicultura.ao",
            "password": "admin123456"
        }
        
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json=login_data
        )
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        else:
            print(f"❌ Erro no login: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Erro ao fazer login: {e}")
        return None

def test_audit_api(token):
    """Testa a API de auditoria"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Testar endpoint de stats
        print("🔍 Testando endpoint de estatísticas...")
        response = requests.get(
            "http://localhost:8000/api/auditoria/dashboard/stats",
            headers=headers
        )
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ Stats obtidas com sucesso:")
            print(json.dumps(stats, indent=2))
        else:
            print(f"❌ Erro ao obter stats: {response.status_code} - {response.text}")
            return False
        
        # Testar endpoint principal
        print("\n🔍 Testando endpoint principal...")
        response = requests.get(
            "http://localhost:8000/api/auditoria",
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Logs obtidos com sucesso:")
            print(f"Total de logs: {data.get('total', 0)}")
            print(f"Logs retornados: {len(data.get('logs', []))}")
            
            # Mostrar primeiro log
            if data.get('logs'):
                first_log = data['logs'][0]
                print(f"Primeiro log: ID={first_log.get('id')}, Ação={first_log.get('acao')}")
        else:
            print(f"❌ Erro ao obter logs: {response.status_code} - {response.text}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar API: {e}")
        return False

def main():
    """Função principal"""
    print("🔐 Obtendo token de autenticação...")
    
    token = get_auth_token()
    if not token:
        print("❌ Não foi possível obter token de autenticação")
        sys.exit(1)
    
    print("✅ Token obtido com sucesso!")
    print(f"Token: {token[:50]}...")
    
    print("\n🧪 Testando API de auditoria...")
    if test_audit_api(token):
        print("\n✅ API de auditoria funcionando corretamente!")
    else:
        print("\n❌ Problemas na API de auditoria")
        sys.exit(1)

if __name__ == "__main__":
    main()
