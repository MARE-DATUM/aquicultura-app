from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict
from app.models.eixo_5w2h import Eixo5W2H, Periodo5W2H
from app.models.audit_log import AcaoAudit
from app.schemas.eixo_5w2h import Eixo5W2HCreate, Eixo5W2HUpdate
from app.services.audit_service import AuditService
from datetime import datetime


class Eixo5W2HService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)

    def create_eixo_5w2h(self, eixo_data: Eixo5W2HCreate, user_id: int) -> Eixo5W2H:
        """Cria novo eixo 5W2H"""
        eixo = Eixo5W2H(**eixo_data.dict())
        self.db.add(eixo)
        self.db.commit()
        self.db.refresh(eixo)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.CREATE,
            entity="Eixo5W2H",
            entity_id=eixo.id,
            details=f"Eixo 5W2H criado para projeto {eixo.projeto_id} - período {eixo.periodo.value}"
        )
        
        return eixo

    def get_eixos_5w2h(
        self,
        skip: int = 0,
        limit: int = 100,
        projeto_id: Optional[int] = None,
        periodo: Optional[Periodo5W2H] = None,
        search: Optional[str] = None
    ) -> List[Eixo5W2H]:
        """Lista eixos 5W2H com filtros"""
        query = self.db.query(Eixo5W2H)
        
        if projeto_id:
            query = query.filter(Eixo5W2H.projeto_id == projeto_id)
        
        if periodo:
            query = query.filter(Eixo5W2H.periodo == periodo)
        
        if search:
            query = query.filter(
                or_(
                    Eixo5W2H.what.ilike(f"%{search}%"),
                    Eixo5W2H.why.ilike(f"%{search}%"),
                    Eixo5W2H.where.ilike(f"%{search}%"),
                    Eixo5W2H.who.ilike(f"%{search}%"),
                    Eixo5W2H.how.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()

    def get_eixo_5w2h_by_id(self, eixo_id: int) -> Optional[Eixo5W2H]:
        """Obtém eixo 5W2H por ID"""
        return self.db.query(Eixo5W2H).filter(Eixo5W2H.id == eixo_id).first()

    def update_eixo_5w2h(
        self,
        eixo_id: int,
        eixo_data: Eixo5W2HUpdate,
        user_id: int
    ) -> Optional[Eixo5W2H]:
        """Atualiza eixo 5W2H"""
        eixo = self.get_eixo_5w2h_by_id(eixo_id)
        if not eixo:
            return None
        
        update_data = eixo_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(eixo, field, value)
        
        self.db.commit()
        self.db.refresh(eixo)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.UPDATE,
            entity="Eixo5W2H",
            entity_id=eixo.id,
            details=f"Eixo 5W2H atualizado para projeto {eixo.projeto_id}"
        )
        
        return eixo

    def delete_eixo_5w2h(self, eixo_id: int, user_id: int) -> bool:
        """Elimina eixo 5W2H"""
        eixo = self.get_eixo_5w2h_by_id(eixo_id)
        if not eixo:
            return False
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.DELETE,
            entity="Eixo5W2H",
            entity_id=eixo.id,
            details=f"Eixo 5W2H eliminado para projeto {eixo.projeto_id}"
        )
        
        self.db.delete(eixo)
        self.db.commit()
        return True

    def get_eixos_by_projeto_periodo(self, projeto_id: int) -> Dict[str, List[Eixo5W2H]]:
        """Obtém eixos 5W2H agrupados por período para um projeto"""
        eixos = self.db.query(Eixo5W2H).filter(Eixo5W2H.projeto_id == projeto_id).all()
        
        resultado = {}
        for periodo in Periodo5W2H:
            resultado[periodo.value] = [eixo for eixo in eixos if eixo.periodo == periodo]
        
        return resultado

    def get_eixos_stats(self) -> dict:
        """Obtém estatísticas de eixos 5W2H para dashboard"""
        total_eixos = self.db.query(Eixo5W2H).count()
        
        # Agregação por período
        stats_periodo = {}
        for periodo in Periodo5W2H:
            count = self.db.query(Eixo5W2H).filter(
                Eixo5W2H.periodo == periodo
            ).count()
            stats_periodo[periodo.value] = count
        
        # Agregação por projeto
        projetos_com_eixos = self.db.query(Eixo5W2H.projeto_id).distinct().count()
        
        # Orçamento total por período
        orcamento_por_periodo = {}
        for periodo in Periodo5W2H:
            total = self.db.query(Eixo5W2H.how_much_kz).filter(
                Eixo5W2H.periodo == periodo
            ).all()
            orcamento_por_periodo[periodo.value] = sum(float(item[0]) for item in total)
        
        return {
            "total_eixos": total_eixos,
            "por_periodo": stats_periodo,
            "projetos_com_eixos": projetos_com_eixos,
            "orcamento_por_periodo": orcamento_por_periodo
        }
