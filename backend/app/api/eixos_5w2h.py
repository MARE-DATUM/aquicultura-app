from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.schemas.eixo_5w2h import Eixo5W2H, Eixo5W2HCreate, Eixo5W2HUpdate, Eixo5W2HResponse
from app.services.eixo_5w2h_service import Eixo5W2HService
from app.core.deps import get_current_active_user, require_root_or_gestao
from app.models.eixo_5w2h import Periodo5W2H

router = APIRouter()


@router.post("/", response_model=Eixo5W2H)
def create_eixo_5w2h(
    eixo_data: Eixo5W2HCreate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Cria novo eixo 5W2H (ROOT ou GESTAO_DADOS)"""
    eixo_service = Eixo5W2HService(db)
    return eixo_service.create_eixo_5w2h(eixo_data, current_user.id)


@router.get("/", response_model=List[Eixo5W2HResponse])
def read_eixos_5w2h(
    skip: int = 0,
    limit: int = 100,
    projeto_id: Optional[int] = None,
    periodo: Optional[Periodo5W2H] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista eixos 5W2H com filtros (todos os utilizadores)"""
    eixo_service = Eixo5W2HService(db)
    return eixo_service.get_eixos_5w2h(
        skip=skip,
        limit=limit,
        projeto_id=projeto_id,
        periodo=periodo,
        search=search
    )


@router.get("/{eixo_id}", response_model=Eixo5W2HResponse)
def read_eixo_5w2h(
    eixo_id: int,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém eixo 5W2H por ID (todos os utilizadores)"""
    eixo_service = Eixo5W2HService(db)
    eixo = eixo_service.get_eixo_5w2h_by_id(eixo_id)
    if not eixo:
        raise HTTPException(status_code=404, detail="Eixo 5W2H not found")
    return eixo


@router.put("/{eixo_id}", response_model=Eixo5W2H)
def update_eixo_5w2h(
    eixo_id: int,
    eixo_data: Eixo5W2HUpdate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Atualiza eixo 5W2H (ROOT ou GESTAO_DADOS)"""
    eixo_service = Eixo5W2HService(db)
    eixo = eixo_service.update_eixo_5w2h(eixo_id, eixo_data, current_user.id)
    if not eixo:
        raise HTTPException(status_code=404, detail="Eixo 5W2H not found")
    return eixo


@router.delete("/{eixo_id}")
def delete_eixo_5w2h(
    eixo_id: int,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Elimina eixo 5W2H (ROOT ou GESTAO_DADOS)"""
    eixo_service = Eixo5W2HService(db)
    success = eixo_service.delete_eixo_5w2h(eixo_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Eixo 5W2H not found")
    return {"message": "Eixo 5W2H deleted successfully"}


@router.get("/projeto/{projeto_id}/periodos")
def get_eixos_by_projeto_periodo(
    projeto_id: int,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém eixos 5W2H agrupados por período para um projeto (todos os utilizadores)"""
    eixo_service = Eixo5W2HService(db)
    return eixo_service.get_eixos_by_projeto_periodo(projeto_id)
