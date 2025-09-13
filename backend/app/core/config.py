from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./aquicultura.db")
    
    # JWT
    jwt_secret: str = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    jwt_refresh_token_expire_days: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Admin
    admin_email: str = os.getenv("ADMIN_EMAIL", "admin@aquicultura.ao")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "admin123456")
    
    # Environment
    env: str = os.getenv("ENV", "development")
    node_env: str = os.getenv("NODE_ENV", "development")
    timezone: str = os.getenv("TZ", "Africa/Luanda")
    
    # CORS Configuration
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # Rate Limiting
    rate_limit_login_attempts: int = int(os.getenv("RATE_LIMIT_LOGIN_ATTEMPTS", "5"))
    rate_limit_login_window_minutes: int = int(os.getenv("RATE_LIMIT_LOGIN_WINDOW_MINUTES", "5"))
    rate_limit_login_block_minutes: int = int(os.getenv("RATE_LIMIT_LOGIN_BLOCK_MINUTES", "15"))
    
    # Application
    app_name: str = os.getenv("APP_NAME", "App de Gestão dos 21 Projectos de Aquicultura")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    default_currency: str = os.getenv("DEFAULT_CURRENCY", "Kz")
    default_locale: str = os.getenv("DEFAULT_LOCALE", "pt-AO")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    allowed_hosts: str = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1")
    trusted_origins: str = os.getenv("TRUSTED_ORIGINS", "http://localhost:3000,http://localhost:8000")
    
    class Config:
        env_file = ".env"

    @property
    def cors_origins_list(self) -> List[str]:
        """Converte string de origins CORS em lista"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        """Converte string de hosts permitidos em lista"""
        return [host.strip() for host in self.allowed_hosts.split(",") if host.strip()]


def get_cors_origins() -> List[str]:
    """Função para obter origins CORS de forma segura"""
    settings_instance = Settings()
    return settings_instance.cors_origins_list

settings = Settings()
