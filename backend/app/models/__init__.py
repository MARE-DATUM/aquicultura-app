from .user import User
from .provincia import Provincia
from .projeto import Projeto
from .eixo_5w2h import Eixo5W2H
from .indicador import Indicador
from .licenciamento import Licenciamento
from .audit_log import AuditLog
from app.db.database import Base

__all__ = [
    "Base",
    "User",
    "Provincia", 
    "Projeto",
    "Eixo5W2H",
    "Indicador",
    "Licenciamento",
    "AuditLog"
]
