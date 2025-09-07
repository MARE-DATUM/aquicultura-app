from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.schemas.audit_log import AuditLog, AuditLogResponse
from app.services.audit_service import AuditService
from app.core.deps import get_current_active_user, require_root
from app.models.audit_log import AcaoAudit

router = APIRouter()


@router.get("/", response_model=List[AuditLogResponse])
def read_audit_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    acao: Optional[AcaoAudit] = None,
    entidade: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Lista logs de auditoria com filtros (apenas ROOT)"""
    audit_service = AuditService(db)
    return audit_service.get_audit_logs(
        skip=skip,
        limit=limit,
        user_id=user_id,
        acao=acao,
        entidade=entidade,
        data_inicio=data_inicio,
        data_fim=data_fim
    )


@router.get("/{log_id}", response_model=AuditLogResponse)
def read_audit_log(
    log_id: int,
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Obtém log de auditoria por ID (apenas ROOT)"""
    audit_service = AuditService(db)
    log = audit_service.get_audit_log_by_id(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return log


@router.get("/export/csv")
def export_audit_logs_csv(
    user_id: Optional[int] = None,
    acao: Optional[AcaoAudit] = None,
    entidade: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Exporta logs de auditoria para CSV (apenas ROOT)"""
    audit_service = AuditService(db)
    return audit_service.export_audit_logs_csv(
        user_id=user_id,
        acao=acao,
        entidade=entidade,
        data_inicio=data_inicio,
        data_fim=data_fim
    )


@router.get("/dashboard/stats")
def get_audit_stats(
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de auditoria para dashboard (apenas ROOT)"""
    audit_service = AuditService(db)
    return audit_service.get_audit_stats()
