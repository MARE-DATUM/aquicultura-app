from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog, AcaoAudit
from typing import Optional
from datetime import datetime


class AuditService:
    def __init__(self, db: Session):
        self.db = db
    
    def log_action(
        self,
        user_id: Optional[int] = None,
        action: AcaoAudit = AcaoAudit.LOGIN,
        entity: Optional[str] = None,
        entity_id: Optional[int] = None,
        ip: Optional[str] = None,
        details: Optional[str] = None
    ) -> AuditLog:
        """Regista ação no log de auditoria"""
        audit_log = AuditLog(
            user_id=user_id,
            acao=action,
            entidade=entity,
            entidade_id=entity_id,
            ip=ip,
            detalhes=details,
            timestamp=datetime.utcnow()
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        return audit_log
    
    def get_audit_logs(
        self,
        user_id: Optional[int] = None,
        action: Optional[AcaoAudit] = None,
        entity: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ):
        """Obtém logs de auditoria com filtros"""
        query = self.db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.acao == action)
        if entity:
            query = query.filter(AuditLog.entidade == entity)
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        
        return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
