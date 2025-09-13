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


@router.get("/")
def read_audit_logs(
    page: int = 1,
    limit: int = 20,
    user_id: Optional[int] = None,
    acao: Optional[AcaoAudit] = None,
    entidade: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    search: Optional[str] = None,
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Lista logs de auditoria com filtros e estatísticas (apenas ROOT)"""
    audit_service = AuditService(db)
    
    # Calcular skip baseado na página
    skip = (page - 1) * limit
    
    # Buscar logs
    logs = audit_service.get_audit_logs(
        skip=skip,
        limit=limit,
        user_id=user_id,
        acao=acao,
        entidade=entidade,
        data_inicio=data_inicio,
        data_fim=data_fim,
        search=search
    )
    
    # Buscar estatísticas
    stats = audit_service.get_audit_stats()
    
    # Contar total de logs para paginação
    total = audit_service.count_audit_logs(
        user_id=user_id,
        acao=acao,
        entidade=entidade,
        data_inicio=data_inicio,
        data_fim=data_fim,
        search=search
    )
    
    return {
        "logs": logs,
        "stats": stats,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }


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
    search: Optional[str] = None,
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Exporta logs de auditoria para CSV (apenas ROOT)"""
    from fastapi import Response
    
    audit_service = AuditService(db)
    csv_content = audit_service.export_audit_logs_csv(
        user_id=user_id,
        acao=acao,
        entidade=entidade,
        data_inicio=data_inicio,
        data_fim=data_fim,
        search=search
    )
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=auditoria.csv"}
    )


@router.get("/dashboard/stats")
def get_audit_stats(
    current_user = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de auditoria para dashboard (apenas ROOT)"""
    audit_service = AuditService(db)
    return audit_service.get_audit_stats()
