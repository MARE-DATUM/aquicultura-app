from typing import Dict, Optional
from datetime import datetime, timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from app.core.config import settings

# Dicionário em memória para armazenar tentativas de login
# Em produção, usar Redis
login_attempts: Dict[str, Dict[str, any]] = {}


def get_limiter():
    """Cria instância do rate limiter"""
    limiter = Limiter(key_func=get_remote_address)
    return limiter


def check_login_rate_limit(ip: str) -> bool:
    """Verifica se o IP pode tentar fazer login"""
    now = datetime.utcnow()
    
    if ip not in login_attempts:
        login_attempts[ip] = {
            "attempts": 0,
            "first_attempt": now,
            "blocked_until": None
        }
        return True
    
    attempt_data = login_attempts[ip]
    
    # Verifica se está bloqueado
    if attempt_data["blocked_until"] and now < attempt_data["blocked_until"]:
        return False
    
    # Reset se passou o período de bloqueio
    if attempt_data["blocked_until"] and now >= attempt_data["blocked_until"]:
        attempt_data["attempts"] = 0
        attempt_data["blocked_until"] = None
        attempt_data["first_attempt"] = now
    
    # Verifica se excedeu o limite de tentativas
    window_start = now - timedelta(minutes=settings.rate_limit_login_window_minutes)
    if attempt_data["first_attempt"] < window_start:
        # Reset se passou a janela de tempo
        attempt_data["attempts"] = 0
        attempt_data["first_attempt"] = now
    
    if attempt_data["attempts"] >= settings.rate_limit_login_attempts:
        # Bloqueia por 15 minutos
        attempt_data["blocked_until"] = now + timedelta(minutes=settings.rate_limit_login_block_minutes)
        return False
    
    return True


def record_login_attempt(ip: str, success: bool):
    """Regista tentativa de login"""
    if ip not in login_attempts:
        login_attempts[ip] = {
            "attempts": 0,
            "first_attempt": datetime.utcnow(),
            "blocked_until": None
        }
    
    if success:
        # Reset em caso de sucesso
        login_attempts[ip]["attempts"] = 0
        login_attempts[ip]["blocked_until"] = None
    else:
        # Incrementa tentativas em caso de falha
        login_attempts[ip]["attempts"] += 1
