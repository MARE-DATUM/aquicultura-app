from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from app.models.licenciamento import Licenciamento, StatusLicenciamento, EntidadeResponsavel
from app.models.audit_log import AcaoAudit
from app.schemas.licenciamento import LicenciamentoCreate, LicenciamentoUpdate
from app.services.audit_service import AuditService
from datetime import datetime


class LicenciamentoService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)

    def create_licenciamento(self, licenciamento_data: LicenciamentoCreate, user_id: int) -> Licenciamento:
        """Cria novo licenciamento"""
        licenciamento = Licenciamento(**licenciamento_data.dict())
        self.db.add(licenciamento)
        self.db.commit()
        self.db.refresh(licenciamento)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.CREATE,
            entidade="Licenciamento",
            entidade_id=licenciamento.id,
            details=f"Licenciamento criado para projeto {licenciamento.projeto_id}"
        )
        
        return licenciamento

    def get_licenciamentos(
        self,
        skip: int = 0,
        limit: int = 100,
        projeto_id: Optional[int] = None,
        status: Optional[StatusLicenciamento] = None,
        entidade_responsavel: Optional[EntidadeResponsavel] = None,
        search: Optional[str] = None
    ) -> List[Licenciamento]:
        """Lista licenciamentos com filtros"""
        query = self.db.query(Licenciamento)
        
        if projeto_id:
            query = query.filter(Licenciamento.projeto_id == projeto_id)
        
        if status:
            query = query.filter(Licenciamento.status == status)
        
        if entidade_responsavel:
            query = query.filter(Licenciamento.entidade_responsavel == entidade_responsavel)
        
        if search:
            query = query.filter(
                or_(
                    Licenciamento.observacoes.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()

    def get_licenciamento_by_id(self, licenciamento_id: int) -> Optional[Licenciamento]:
        """Obtém licenciamento por ID"""
        return self.db.query(Licenciamento).filter(Licenciamento.id == licenciamento_id).first()

    def update_licenciamento(
        self,
        licenciamento_id: int,
        licenciamento_data: LicenciamentoUpdate,
        user_id: int
    ) -> Optional[Licenciamento]:
        """Atualiza licenciamento"""
        licenciamento = self.get_licenciamento_by_id(licenciamento_id)
        if not licenciamento:
            return None
        
        update_data = licenciamento_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(licenciamento, field, value)
        
        self.db.commit()
        self.db.refresh(licenciamento)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.UPDATE,
            entidade="Licenciamento",
            entidade_id=licenciamento.id,
            details=f"Licenciamento atualizado para projeto {licenciamento.projeto_id}"
        )
        
        return licenciamento

    def delete_licenciamento(self, licenciamento_id: int, user_id: int) -> bool:
        """Elimina licenciamento"""
        licenciamento = self.get_licenciamento_by_id(licenciamento_id)
        if not licenciamento:
            return False
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.DELETE,
            entidade="Licenciamento",
            entidade_id=licenciamento.id,
            details=f"Licenciamento eliminado para projeto {licenciamento.projeto_id}"
        )
        
        self.db.delete(licenciamento)
        self.db.commit()
        return True

    def update_licenciamento_status(
        self,
        licenciamento_id: int,
        status: StatusLicenciamento,
        observacoes: Optional[str] = None,
        user_id: int = None
    ) -> bool:
        """Atualiza status do licenciamento"""
        licenciamento = self.get_licenciamento_by_id(licenciamento_id)
        if not licenciamento:
            return False
        
        old_status = licenciamento.status
        licenciamento.status = status
        
        if observacoes:
            licenciamento.observacoes = observacoes
        
        # Se aprovado ou negado, define data de decisão
        if status in [StatusLicenciamento.APROVADO, StatusLicenciamento.NEGADO]:
            licenciamento.data_decisao = datetime.utcnow()
        
        self.db.commit()
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.STATUS_CHANGE,
            entidade="Licenciamento",
            entidade_id=licenciamento.id,
            details=f"Status alterado de {old_status.value} para {status.value}"
        )
        
        return True

    def get_licenciamentos_stats(self) -> dict:
        """Obtém estatísticas de licenciamentos para dashboard"""
        total_licenciamentos = self.db.query(Licenciamento).count()
        
        # Agregação por status
        stats_status = {}
        for status in StatusLicenciamento:
            count = self.db.query(Licenciamento).filter(
                Licenciamento.status == status
            ).count()
            stats_status[status.value] = count
        
        # Agregação por entidade responsável
        stats_entidade = {}
        for entidade in EntidadeResponsavel:
            count = self.db.query(Licenciamento).filter(
                Licenciamento.entidade_responsavel == entidade
            ).count()
            stats_entidade[entidade.value] = count
        
        # Tempo médio de processamento
        licenciamentos_com_decissao = self.db.query(Licenciamento).filter(
            Licenciamento.data_decisao.isnot(None)
        ).all()
        
        tempo_medio_dias = 0
        if licenciamentos_com_decissao:
            total_dias = 0
            for lic in licenciamentos_com_decissao:
                dias = (lic.data_decisao - lic.data_submissao).days
                total_dias += dias
            tempo_medio_dias = total_dias / len(licenciamentos_com_decissao)
        
        return {
            "total_licenciamentos": total_licenciamentos,
            "por_status": stats_status,
            "por_entidade": stats_entidade,
            "tempo_medio_processamento_dias": round(tempo_medio_dias, 1),
            "taxa_aprovacao": round(
                (stats_status.get(StatusLicenciamento.APROVADO.value, 0) / total_licenciamentos * 100) 
                if total_licenciamentos > 0 else 0, 2
            )
        }
