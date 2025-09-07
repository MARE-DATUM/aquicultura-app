from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.schemas.indicador import Indicador, IndicadorCreate, IndicadorUpdate, IndicadorResponse
from app.services.indicador_service import IndicadorService
from app.core.deps import get_current_active_user, require_root_or_gestao
from app.models.indicador import Trimestre

router = APIRouter()


@router.post("/", response_model=Indicador)
def create_indicador(
    indicador_data: IndicadorCreate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Cria novo indicador (ROOT ou GESTAO_DADOS)"""
    indicador_service = IndicadorService(db)
    return indicador_service.create_indicador(indicador_data, current_user.id)


@router.get("/", response_model=List[IndicadorResponse])
def read_indicadores(
    skip: int = 0,
    limit: int = 100,
    projeto_id: Optional[int] = None,
    periodo_referencia: Optional[Trimestre] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista indicadores com filtros (todos os utilizadores)"""
    indicador_service = IndicadorService(db)
    return indicador_service.get_indicadores(
        skip=skip,
        limit=limit,
        projeto_id=projeto_id,
        periodo_referencia=periodo_referencia,
        search=search
    )


@router.get("/{indicador_id}", response_model=IndicadorResponse)
def read_indicador(
    indicador_id: int,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém indicador por ID (todos os utilizadores)"""
    indicador_service = IndicadorService(db)
    indicador = indicador_service.get_indicador_by_id(indicador_id)
    if not indicador:
        raise HTTPException(status_code=404, detail="Indicador not found")
    return indicador


@router.put("/{indicador_id}", response_model=Indicador)
def update_indicador(
    indicador_id: int,
    indicador_data: IndicadorUpdate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Atualiza indicador (ROOT ou GESTAO_DADOS)"""
    indicador_service = IndicadorService(db)
    indicador = indicador_service.update_indicador(indicador_id, indicador_data, current_user.id)
    if not indicador:
        raise HTTPException(status_code=404, detail="Indicador not found")
    return indicador


@router.delete("/{indicador_id}")
def delete_indicador(
    indicador_id: int,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Elimina indicador (ROOT ou GESTAO_DADOS)"""
    indicador_service = IndicadorService(db)
    success = indicador_service.delete_indicador(indicador_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Indicador not found")
    return {"message": "Indicador deleted successfully"}


@router.get("/dashboard/stats")
def get_indicadores_stats(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de indicadores para dashboard (todos os utilizadores)"""
    indicador_service = IndicadorService(db)
    return indicador_service.get_indicadores_stats()


@router.post("/import")
def import_indicadores(
    file_content: str,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Importa indicadores via CSV (ROOT ou GESTAO_DADOS)"""
    indicador_service = IndicadorService(db)
    return indicador_service.import_indicadores_csv(file_content, current_user.id)


@router.get("/export")
def export_indicadores(
    projeto_id: Optional[int] = None,
    periodo_referencia: Optional[Trimestre] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Exporta indicadores para CSV (todos os utilizadores)"""
    indicador_service = IndicadorService(db)
    return indicador_service.export_indicadores_csv(projeto_id, periodo_referencia)
