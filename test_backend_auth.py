#!/usr/bin/env python3
"""
Script para testar autenticação diretamente no backend
"""
import requests
import json

def test_backend_auth():
    """Testa autenticação no backend"""
    try:
        # Testar endpoint de health primeiro
        response = requests.get("http://localhost:8000/health")
        print(f"Health check: {response.status_code}")
        
        # Testar endpoint de auth/me com token
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhcXVpY3VsdHVyYS5hbyIsInVzZXJfaWQiOjEsInJvbGUiOiJST09UIiwiZXhwIjoxNzU3ODkwMjg1LCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU3ODAzODg1fQ.UirDQVefK1BUmANaN-L3HFdsoiYIpAM89oeuIgZHz6M"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Testar auth/me
        response = requests.get("http://localhost:8000/api/auth/me", headers=headers)
        print(f"Auth/me status: {response.status_code}")
        if response.status_code == 200:
            print(f"Auth/me data: {response.json()}")
        else:
            print(f"Auth/me error: {response.text}")
        
        # Testar auditoria
        response = requests.get("http://localhost:8000/api/auditoria?limit=100", headers=headers)
        print(f"Auditoria status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Auditoria data: {json.dumps(data, indent=2)}")
        else:
            print(f"Auditoria error: {response.text}")
            
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    test_backend_auth()
