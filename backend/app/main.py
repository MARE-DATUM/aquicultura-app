from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings, get_cors_origins
from app.db.database import engine
from app.db.database import Base
from app.api import auth, users, projetos, indicadores, licenciamentos, eixos_5w2h, auditoria, provincias, dashboard

# Cria tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Cria aplicação FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Sistema de gestão dos 21 projectos de aquicultura em Angola",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configura rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Configura middleware de segurança
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts_list + ["*.localhost"]
)

# Inclui rotas
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(projetos.router, prefix="/api/projetos", tags=["projetos"])
app.include_router(indicadores.router, prefix="/api/indicadores", tags=["indicadores"])
app.include_router(licenciamentos.router, prefix="/api/licenciamentos", tags=["licenciamentos"])
app.include_router(eixos_5w2h.router, prefix="/api/eixos-5w2h", tags=["eixos-5w2h"])
app.include_router(auditoria.router, prefix="/api/auditoria", tags=["auditoria"])
app.include_router(provincias.router, prefix="/api/provincias", tags=["provincias"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "App de Gestão dos 21 Projectos de Aquicultura",
        "version": settings.app_version,
        "environment": settings.env
    }


@app.get("/health")
async def health_check():
    """Health check geral da aplicação"""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": settings.app_version,
        "environment": settings.env,
        "services": {
            "api": "healthy",
            "database": "healthy",  # TODO: Implementar verificação real
            "redis": "healthy"      # TODO: Implementar verificação real
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
