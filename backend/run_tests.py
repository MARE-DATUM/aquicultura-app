#!/usr/bin/env python3
"""
Script para executar testes do backend
"""
import subprocess
import sys
import os

def run_tests():
    """Executa os testes do backend"""
    print("🧪 Executando testes do backend...")
    
    # Mudar para o diretório do backend
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Comando para executar pytest
    cmd = [
        "python", "-m", "pytest",
        "tests/",
        "-v",
        "--tb=short",
        "--cov=app",
        "--cov-report=html",
        "--cov-report=term-missing"
    ]
    
    try:
        result = subprocess.run(cmd, check=True)
        print("✅ Testes executados com sucesso!")
        return result.returncode
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar testes: {e}")
        return e.returncode
    except FileNotFoundError:
        print("❌ pytest não encontrado. Instale as dependências com: pip install -r requirements.txt")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
