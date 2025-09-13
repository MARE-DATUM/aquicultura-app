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
        acao: Optional[AcaoAudit] = None,
        entidade: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ):
        """Obtém logs de auditoria com filtros"""
        query = self.db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if acao:
            query = query.filter(AuditLog.acao == acao)
        if entidade:
            query = query.filter(AuditLog.entidade == entidade)
        if data_inicio:
            query = query.filter(AuditLog.timestamp >= data_inicio)
        if data_fim:
            query = query.filter(AuditLog.timestamp <= data_fim)
        if search:
            # Pesquisar em detalhes, entidade e ação
            search_filter = f"%{search}%"
            query = query.filter(
                (AuditLog.detalhes.ilike(search_filter)) |
                (AuditLog.entidade.ilike(search_filter)) |
                (AuditLog.acao.ilike(search_filter))
            )
        
        return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    def get_audit_stats(self) -> dict:
        """Obtém estatísticas de auditoria para dashboard"""
        total_logs = self.db.query(AuditLog).count()
        
        # Agregação por ação
        stats_acao = {}
        for acao in AcaoAudit:
            count = self.db.query(AuditLog).filter(AuditLog.acao == acao).count()
            stats_acao[acao.value] = count
        
        # Agregação por entidade
        entidades = self.db.query(AuditLog.entidade).distinct().all()
        stats_entidade = {}
        for entidade in entidades:
            if entidade[0]:  # Verificar se não é None
                count = self.db.query(AuditLog).filter(AuditLog.entidade == entidade[0]).count()
                stats_entidade[entidade[0]] = count
        
        # Usuários mais ativos
        from sqlalchemy import func
        usuarios_ativos = self.db.query(
            AuditLog.user_id,
            func.count(AuditLog.id).label('total_acoes')
        ).filter(
            AuditLog.user_id.isnot(None)
        ).group_by(AuditLog.user_id).order_by(
            func.count(AuditLog.id).desc()
        ).limit(5).all()
        
        return {
            "total_logs": total_logs,
            "por_acao": stats_acao,
            "por_entidade": stats_entidade,
            "usuarios_mais_ativos": [
                {"user_id": user.user_id, "total_acoes": user.total_acoes}
                for user in usuarios_ativos
            ]
        }
    
    def export_audit_logs_csv(
        self,
        user_id: Optional[int] = None,
        acao: Optional[AcaoAudit] = None,
        entidade: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        search: Optional[str] = None
    ) -> str:
        """Exporta logs de auditoria para CSV"""
        import csv
        import io
        
        # Obter logs com os mesmos filtros
        logs = self.get_audit_logs(
            user_id=user_id,
            acao=acao,
            entidade=entidade,
            data_inicio=data_inicio,
            data_fim=data_fim,
            search=search,
            skip=0,
            limit=10000  # Limite alto para exportação
        )
        
        # Criar CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Cabeçalho
        writer.writerow([
            'ID', 'Data/Hora', 'Utilizador', 'Email', 'Ação', 
            'Entidade', 'ID Entidade', 'IP', 'Detalhes'
        ])
        
        # Dados
        for log in logs:
            writer.writerow([
                log.id,
                log.timestamp.isoformat() if log.timestamp else '',
                log.user.full_name if log.user else 'Sistema',
                log.user.email if log.user else '',
                log.acao.value if log.acao else '',
                log.entidade or '',
                log.entidade_id or '',
                log.ip or '',
                log.detalhes or ''
            ])
        
        return output.getvalue()
    
    def count_audit_logs(
        self,
        user_id: Optional[int] = None,
        acao: Optional[AcaoAudit] = None,
        entidade: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        search: Optional[str] = None
    ) -> int:
        """Conta logs de auditoria com filtros"""
        query = self.db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        if acao:
            query = query.filter(AuditLog.acao == acao)
        
        if entidade:
            query = query.filter(AuditLog.entidade == entidade)
        
        if data_inicio:
            query = query.filter(AuditLog.timestamp >= data_inicio)
        
        if data_fim:
            query = query.filter(AuditLog.timestamp <= data_fim)
        
        if search:
            query = query.filter(
                AuditLog.detalhes.ilike(f"%{search}%")
            )
        
        return query.count()