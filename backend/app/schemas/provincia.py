from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProvinciaBase(BaseModel):
    nome: str


class ProvinciaCreate(ProvinciaBase):
    pass


class ProvinciaUpdate(BaseModel):
    nome: Optional[str] = None


class Provincia(ProvinciaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProvinciaResponse(ProvinciaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProvinciaWithProjetos(Provincia):
    projetos: List["ProjetoResponse"] = []

    class Config:
        from_attributes = True
