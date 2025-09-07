from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from app.models.audit_log import AcaoAudit


class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    papel: Optional[str] = None
    acao: AcaoAudit
    entidade: Optional[str] = None
    entidade_id: Optional[int] = None
    ip: Optional[str] = None
    detalhes: Optional[str] = None


class AuditLog(AuditLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogResponse(AuditLog):
    user: Optional[Any] = None

    class Config:
        from_attributes = True
