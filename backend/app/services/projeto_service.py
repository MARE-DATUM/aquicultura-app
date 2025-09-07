from sqlalchemy.orm import Session
from app.models.projeto import Projeto, TipoProjeto, FonteFinanciamento, EstadoProjeto
from app.schemas.projeto import ProjetoCreate, ProjetoUpdate
from app.services.audit_service import AuditService
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from datetime import datetime


class ProjetoService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)
    
    def create_projeto(self, projeto_data: ProjetoCreate, created_by_user_id: Optional[int] = None) -> Projeto:
        """Cria novo projeto"""
        db_projeto = Projeto(**projeto_data.dict())
        
        self.db.add(db_projeto)
        self.db.commit()
        self.db.refresh(db_projeto)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=created_by_user_id,
            action="CREATE",
            entity="Projeto",
            entity_id=db_projeto.id,
            details=f"Created project {db_projeto.nome}"
        )
        
        return db_projeto
    
    def get_projeto_by_id(self, projeto_id: int) -> Optional[Projeto]:
        """Obtém projeto por ID"""
        return self.db.query(Projeto).filter(Projeto.id == projeto_id).first()
    
    def get_projetos(
        self,
        skip: int = 0,
        limit: int = 100,
        provincia_id: Optional[int] = None,
        tipo: Optional[TipoProjeto] = None,
        fonte_financiamento: Optional[FonteFinanciamento] = None,
        estado: Optional[EstadoProjeto] = None,
        search: Optional[str] = None
    ) -> List[Projeto]:
        """Lista projetos com filtros"""
        query = self.db.query(Projeto)
        
        if provincia_id:
            query = query.filter(Projeto.provincia_id == provincia_id)
        if tipo:
            query = query.filter(Projeto.tipo == tipo)
        if fonte_financiamento:
            query = query.filter(Projeto.fonte_financiamento == fonte_financiamento)
        if estado:
            query = query.filter(Projeto.estado == estado)
        if search:
            query = query.filter(
                Projeto.nome.ilike(f"%{search}%") |
                Projeto.responsavel.ilike(f"%{search}%") |
                Projeto.descricao.ilike(f"%{search}%")
            )
        
        return query.offset(skip).limit(limit).all()
    
    def update_projeto(self, projeto_id: int, projeto_data: ProjetoUpdate, updated_by_user_id: Optional[int] = None) -> Optional[Projeto]:
        """Atualiza projeto"""
        db_projeto = self.get_projeto_by_id(projeto_id)
        if not db_projeto:
            return None
        
        # Atualiza campos fornecidos
        update_data = projeto_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_projeto, field, value)
        
        self.db.commit()
        self.db.refresh(db_projeto)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=updated_by_user_id,
            action="UPDATE",
            entity="Projeto",
            entity_id=projeto_id,
            details=f"Updated project {db_projeto.nome}"
        )
        
        return db_projeto
    
    def delete_projeto(self, projeto_id: int, deleted_by_user_id: Optional[int] = None) -> bool:
        """Elimina projeto"""
        db_projeto = self.get_projeto_by_id(projeto_id)
        if not db_projeto:
            return False
        
        self.db.delete(db_projeto)
        self.db.commit()
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=deleted_by_user_id,
            action="DELETE",
            entity="Projeto",
            entity_id=projeto_id,
            details=f"Deleted project {db_projeto.nome}"
        )
        
        return True
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Obtém estatísticas para dashboard"""
        from app.models.indicador import Indicador
        from app.models.licenciamento import Licenciamento
        from app.models.indicador import Trimestre
        from app.models.licenciamento import StatusLicenciamento
        
        total_projetos = self.db.query(Projeto).count()
        
        # Projetos por estado
        projetos_por_estado = {}
        for estado in EstadoProjeto:
            count = self.db.query(Projeto).filter(Projeto.estado == estado).count()
            projetos_por_estado[estado.value] = count
        
        # Projetos por fonte de financiamento
        projetos_por_fonte = {}
        for fonte in FonteFinanciamento:
            count = self.db.query(Projeto).filter(Projeto.fonte_financiamento == fonte).count()
            projetos_por_fonte[fonte.value] = count
        
        # Estatísticas de indicadores
        total_indicadores = self.db.query(Indicador).count()
        indicadores_por_trimestre = {}
        for trimestre in ['T1', 'T2', 'T3', 'T4']:
            count = self.db.query(Indicador).filter(Indicador.periodo_referencia == trimestre).count()
            indicadores_por_trimestre[trimestre] = count
        
        # Estatísticas de licenciamentos
        total_licenciamentos = self.db.query(Licenciamento).count()
        licenciamentos_por_status = {}
        for status in StatusLicenciamento:
            count = self.db.query(Licenciamento).filter(Licenciamento.status == status).count()
            licenciamentos_por_status[status.value] = count
        
        # Orçamento total previsto e executado
        orcamento_previsto = self.db.query(Projeto).with_entities(
            Projeto.orcamento_previsto_kz
        ).all()
        orcamento_executado = self.db.query(Projeto).with_entities(
            Projeto.orcamento_executado_kz
        ).all()
        
        total_previsto = sum([float(p[0]) for p in orcamento_previsto if p[0]])
        total_executado = sum([float(e[0]) for e in orcamento_executado if e[0]])
        execucao_media_percentual = round((total_executado / total_previsto * 100), 2) if total_previsto > 0 else 0
        
        return {
            "total_projetos": total_projetos,
            "total_indicadores": total_indicadores,
            "total_licenciamentos": total_licenciamentos,
            "execucao_media_percentual": execucao_media_percentual,
            "projetos_por_estado": projetos_por_estado,
            "projetos_por_fonte": projetos_por_fonte,
            "indicadores_por_trimestre": indicadores_por_trimestre,
            "licenciamentos_por_status": licenciamentos_por_status
        }
