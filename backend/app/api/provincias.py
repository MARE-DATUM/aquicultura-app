from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.provincia import Provincia, ProvinciaResponse
from app.services.provincia_service import ProvinciaService
from app.core.deps import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[ProvinciaResponse])
def read_provincias(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todas as províncias (todos os utilizadores)"""
    provincia_service = ProvinciaService(db)
    return provincia_service.get_provincias()


@router.get("/{provincia_id}", response_model=ProvinciaResponse)
def read_provincia(
    provincia_id: int,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém província por ID (todos os utilizadores)"""
    provincia_service = ProvinciaService(db)
    provincia = provincia_service.get_provincia_by_id(provincia_id)
    if not provincia:
        raise HTTPException(status_code=404, detail="Província not found")
    return provincia


@router.get("/dashboard/mapa")
def get_mapa_provincias(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém dados para mapa das províncias com distribuição de projetos (todos os utilizadores)"""
    provincia_service = ProvinciaService(db)
    return provincia_service.get_mapa_provincias()
