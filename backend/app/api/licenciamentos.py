from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.schemas.licenciamento import Licenciamento, LicenciamentoCreate, LicenciamentoUpdate, LicenciamentoResponse
from app.services.licenciamento_service import LicenciamentoService
from app.core.deps import get_current_active_user, require_root_or_gestao
from app.models.licenciamento import StatusLicenciamento, EntidadeResponsavel

router = APIRouter()


@router.post("/", response_model=Licenciamento)
def create_licenciamento(
    licenciamento_data: LicenciamentoCreate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Cria novo licenciamento (ROOT ou GESTAO_DADOS)"""
    licenciamento_service = LicenciamentoService(db)
    return licenciamento_service.create_licenciamento(licenciamento_data, current_user.id)


@router.get("/", response_model=List[LicenciamentoResponse])
def read_licenciamentos(
    skip: int = 0,
    limit: int = 100,
    projeto_id: Optional[int] = None,
    status: Optional[StatusLicenciamento] = None,
    entidade_responsavel: Optional[EntidadeResponsavel] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista licenciamentos com filtros (todos os utilizadores)"""
    licenciamento_service = LicenciamentoService(db)
    return licenciamento_service.get_licenciamentos(
        skip=skip,
        limit=limit,
        projeto_id=projeto_id,
        status=status,
        entidade_responsavel=entidade_responsavel,
        search=search
    )


@router.get("/{licenciamento_id}", response_model=LicenciamentoResponse)
def read_licenciamento(
    licenciamento_id: int,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém licenciamento por ID (todos os utilizadores)"""
    licenciamento_service = LicenciamentoService(db)
    licenciamento = licenciamento_service.get_licenciamento_by_id(licenciamento_id)
    if not licenciamento:
        raise HTTPException(status_code=404, detail="Licenciamento not found")
    return licenciamento


@router.put("/{licenciamento_id}", response_model=Licenciamento)
def update_licenciamento(
    licenciamento_id: int,
    licenciamento_data: LicenciamentoUpdate,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Atualiza licenciamento (ROOT ou GESTAO_DADOS)"""
    licenciamento_service = LicenciamentoService(db)
    licenciamento = licenciamento_service.update_licenciamento(licenciamento_id, licenciamento_data, current_user.id)
    if not licenciamento:
        raise HTTPException(status_code=404, detail="Licenciamento not found")
    return licenciamento


@router.delete("/{licenciamento_id}")
def delete_licenciamento(
    licenciamento_id: int,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Elimina licenciamento (ROOT ou GESTAO_DADOS)"""
    licenciamento_service = LicenciamentoService(db)
    success = licenciamento_service.delete_licenciamento(licenciamento_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Licenciamento not found")
    return {"message": "Licenciamento deleted successfully"}


@router.put("/{licenciamento_id}/status")
def update_licenciamento_status(
    licenciamento_id: int,
    status: StatusLicenciamento,
    observacoes: Optional[str] = None,
    current_user = Depends(require_root_or_gestao),
    db: Session = Depends(get_db)
):
    """Atualiza status do licenciamento (ROOT ou GESTAO_DADOS)"""
    licenciamento_service = LicenciamentoService(db)
    success = licenciamento_service.update_licenciamento_status(
        licenciamento_id, status, observacoes, current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Licenciamento not found")
    return {"message": "Status updated successfully"}


@router.get("/dashboard/stats")
def get_licenciamentos_stats(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de licenciamentos para dashboard (todos os utilizadores)"""
    licenciamento_service = LicenciamentoService(db)
    return licenciamento_service.get_licenciamentos_stats()
