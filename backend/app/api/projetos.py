from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.schemas.projeto import Projeto, ProjetoCreate, ProjetoUpdate, ProjetoResponse
from app.services.projeto_service import ProjetoService
from app.core.deps import get_current_active_user, require_root_or_gestao
from app.models.projeto import TipoProjeto, FonteFinanciamento, EstadoProjeto

router = APIRouter()


@router.post("/", response_model=Projeto)
def create_projeto(
    projeto_data: ProjetoCreate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Cria novo projeto (ROOT ou GESTAO_DADOS)"""
    projeto_service = ProjetoService(db)
    return projeto_service.create_projeto(projeto_data, current_user.id)


@router.get("/", response_model=List[ProjetoResponse])
def read_projetos(
    skip: int = 0,
    limit: int = 100,
    provincia_id: Optional[int] = None,
    tipo: Optional[TipoProjeto] = None,
    fonte_financiamento: Optional[FonteFinanciamento] = None,
    estado: Optional[EstadoProjeto] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista projetos com filtros (todos os utilizadores)"""
    projeto_service = ProjetoService(db)
    return projeto_service.get_projetos(
        skip=skip,
        limit=limit,
        provincia_id=provincia_id,
        tipo=tipo,
        fonte_financiamento=fonte_financiamento,
        estado=estado,
        search=search
    )


@router.get("/{projeto_id}", response_model=ProjetoResponse)
def read_projeto(
    projeto_id: int,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém projeto por ID (todos os utilizadores)"""
    projeto_service = ProjetoService(db)
    projeto = projeto_service.get_projeto_by_id(projeto_id)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto not found")
    return projeto


@router.put("/{projeto_id}", response_model=Projeto)
def update_projeto(
    projeto_id: int,
    projeto_data: ProjetoUpdate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Atualiza projeto (ROOT ou GESTAO_DADOS)"""
    projeto_service = ProjetoService(db)
    projeto = projeto_service.update_projeto(projeto_id, projeto_data, current_user.id)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto not found")
    return projeto


@router.delete("/{projeto_id}")
def delete_projeto(
    projeto_id: int,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Elimina projeto (ROOT ou GESTAO_DADOS)"""
    projeto_service = ProjetoService(db)
    success = projeto_service.delete_projeto(projeto_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Projeto not found")
    return {"message": "Projeto deleted successfully"}


@router.get("/dashboard/stats")
def get_dashboard_stats(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas para dashboard (todos os utilizadores)"""
    projeto_service = ProjetoService(db)
    return projeto_service.get_dashboard_stats()
