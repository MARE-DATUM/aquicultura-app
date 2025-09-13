from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from app.models.indicador import Indicador, Trimestre
from app.models.audit_log import AcaoAudit
from app.schemas.indicador import IndicadorCreate, IndicadorUpdate
from app.services.audit_service import AuditService
from datetime import datetime
import csv
import io
from decimal import Decimal


class IndicadorService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)

    def create_indicador(self, indicador_data: IndicadorCreate, user_id: int) -> Indicador:
        """Cria novo indicador"""
        indicador = Indicador(**indicador_data.dict())
        self.db.add(indicador)
        self.db.commit()
        self.db.refresh(indicador)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.CREATE,
            entity="Indicador",
            entity_id=indicador.id,
            details=f"Indicador '{indicador.nome}' criado para projeto {indicador.projeto_id}"
        )
        
        return indicador

    def get_indicadores(
        self,
        skip: int = 0,
        limit: int = 100,
        projeto_id: Optional[int] = None,
        periodo_referencia: Optional[Trimestre] = None,
        search: Optional[str] = None
    ) -> List[Indicador]:
        """Lista indicadores com filtros"""
        query = self.db.query(Indicador)
        
        if projeto_id:
            query = query.filter(Indicador.projeto_id == projeto_id)
        
        if periodo_referencia:
            query = query.filter(Indicador.periodo_referencia == periodo_referencia)
        
        if search:
            query = query.filter(
                or_(
                    Indicador.nome.ilike(f"%{search}%"),
                    Indicador.fonte_dados.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()

    def get_indicador_by_id(self, indicador_id: int) -> Optional[Indicador]:
        """Obtém indicador por ID"""
        return self.db.query(Indicador).filter(Indicador.id == indicador_id).first()

    def update_indicador(
        self,
        indicador_id: int,
        indicador_data: IndicadorUpdate,
        user_id: int
    ) -> Optional[Indicador]:
        """Atualiza indicador"""
        indicador = self.get_indicador_by_id(indicador_id)
        if not indicador:
            return None
        
        update_data = indicador_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(indicador, field, value)
        
        self.db.commit()
        self.db.refresh(indicador)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.UPDATE,
            entity="Indicador",
            entity_id=indicador.id,
            details=f"Indicador '{indicador.nome}' atualizado"
        )
        
        return indicador

    def delete_indicador(self, indicador_id: int, user_id: int) -> bool:
        """Elimina indicador"""
        indicador = self.get_indicador_by_id(indicador_id)
        if not indicador:
            return False
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=user_id,
            action=AcaoAudit.DELETE,
            entity="Indicador",
            entity_id=indicador.id,
            details=f"Indicador '{indicador.nome}' eliminado"
        )
        
        self.db.delete(indicador)
        self.db.commit()
        return True

    def get_indicadores_stats(self) -> dict:
        """Obtém estatísticas de indicadores para o dashboard"""
        total_indicadores = self.db.query(Indicador).count()
        
        # Agregação por trimestre
        stats_trimestre = {}
        for trimestre in Trimestre:
            count = self.db.query(Indicador).filter(
                Indicador.periodo_referencia == trimestre
            ).count()
            stats_trimestre[trimestre.value] = count
        
        # Agregação por projeto
        stats_projeto = self.db.query(
            Indicador.projeto_id,
            Indicador.nome,
            Indicador.meta,
            Indicador.valor_actual
        ).all()
        
        # Cálculo de execução média
        execucao_media = 0
        if total_indicadores > 0:
            total_meta = sum(float(item.meta) for item in stats_projeto)
            total_atual = sum(float(item.valor_actual) for item in stats_projeto)
            if total_meta > 0:
                execucao_media = (total_atual / total_meta) * 100
        
        return {
            "total_indicadores": total_indicadores,
            "por_trimestre": stats_trimestre,
            "execucao_media_percentual": round(execucao_media, 2),
            "indicadores_por_projeto": len(set(item.projeto_id for item in stats_projeto))
        }

    def import_indicadores_csv(self, file_content: str, user_id: int) -> dict:
        """Importa indicadores via CSV"""
        try:
            csv_reader = csv.DictReader(io.StringIO(file_content))
            imported_count = 0
            errors = []
            
            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 because of header
                try:
                    # Valida dados obrigatórios
                    required_fields = ['projeto_id', 'nome', 'unidade', 'meta', 'periodo_referencia', 'fonte_dados']
                    for field in required_fields:
                        if not row.get(field):
                            errors.append(f"Linha {row_num}: Campo '{field}' é obrigatório")
                            continue
                    
                    # Cria indicador
                    indicador_data = IndicadorCreate(
                        projeto_id=int(row['projeto_id']),
                        nome=row['nome'],
                        unidade=row['unidade'],
                        meta=Decimal(row['meta']),
                        valor_actual=Decimal(row.get('valor_actual', '0')),
                        periodo_referencia=Trimestre(row['periodo_referencia']),
                        fonte_dados=row['fonte_dados']
                    )
                    
                    self.create_indicador(indicador_data, user_id)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Linha {row_num}: {str(e)}")
            
            # Regista auditoria
            self.audit_service.log_action(
                user_id=user_id,
                action=AcaoAudit.IMPORT,
                entidade="Indicador",
                details=f"Importação CSV: {imported_count} indicadores importados, {len(errors)} erros"
            )
            
            return {
                "imported_count": imported_count,
                "errors": errors,
                "success": len(errors) == 0
            }
            
        except Exception as e:
            return {
                "imported_count": 0,
                "errors": [f"Erro geral: {str(e)}"],
                "success": False
            }

    def export_indicadores_csv(
        self,
        projeto_id: Optional[int] = None,
        periodo_referencia: Optional[Trimestre] = None
    ) -> str:
        """Exporta indicadores para CSV"""
        indicadores = self.get_indicadores(
            skip=0,
            limit=10000,  # Large limit for export
            projeto_id=projeto_id,
            periodo_referencia=periodo_referencia
        )
        
        output = io.StringIO()
        fieldnames = [
            'id', 'projeto_id', 'nome', 'unidade', 'meta', 'valor_actual',
            'periodo_referencia', 'fonte_dados', 'created_at'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for indicador in indicadores:
            writer.writerow({
                'id': indicador.id,
                'projeto_id': indicador.projeto_id,
                'nome': indicador.nome,
                'unidade': indicador.unidade,
                'meta': float(indicador.meta),
                'valor_actual': float(indicador.valor_actual),
                'periodo_referencia': indicador.periodo_referencia.value,
                'fonte_dados': indicador.fonte_dados,
                'created_at': indicador.created_at.isoformat() if indicador.created_at else None
            })
        
        return output.getvalue()

    def get_producao_total(self) -> float:
        """Obtém produção total (soma dos valores atuais dos indicadores)"""
        result = self.db.query(Indicador.valor_actual).all()
        return sum(float(item.valor_actual) for item in result if item.valor_actual)

    def get_familias_beneficiadas(self) -> int:
        """Obtém número de famílias beneficiadas"""
        result = self.db.query(Indicador).filter(
            or_(
                Indicador.nome.ilike('%família%'),
                Indicador.nome.ilike('%familia%'),
                Indicador.nome.ilike('%beneficiar%'),
                Indicador.nome.ilike('%pessoa%'),
                Indicador.nome.ilike('%habitante%')
            )
        ).all()
        
        # Soma os valores atuais desses indicadores
        return sum(int(float(item.valor_actual)) for item in result if item.valor_actual)

    def get_empregos_criados(self) -> int:
        """Obtém número de empregos criados"""
        result = self.db.query(Indicador).filter(
            or_(
                Indicador.nome.ilike('%emprego%'),
                Indicador.nome.ilike('%trabalho%'),
                Indicador.nome.ilike('%funcionário%'),
                Indicador.nome.ilike('%funcionario%'),
                Indicador.nome.ilike('%colaborador%'),
                Indicador.nome.ilike('%posto%')
            )
        ).all()
        
        # Soma os valores atuais desses indicadores
        return sum(int(float(item.valor_actual)) for item in result if item.valor_actual)

    def get_meta_total(self) -> float:
        """Obtém meta total (soma das metas dos indicadores)"""
        result = self.db.query(Indicador.meta).all()
        return sum(float(item.meta) for item in result if item.meta)

    def get_execucao_media_percentual(self) -> float:
        """Obtém execução média percentual"""
        meta_total = self.get_meta_total()
        producao_total = self.get_producao_total()
        
        if meta_total > 0:
            return round((producao_total / meta_total) * 100, 2)
        return 0.0
