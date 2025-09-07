from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.indicador import Trimestre


class IndicadorBase(BaseModel):
    projeto_id: int
    nome: str
    unidade: str
    meta: Decimal
    valor_actual: Decimal = Decimal('0')
    periodo_referencia: Trimestre
    fonte_dados: str


class IndicadorCreate(IndicadorBase):
    pass


class IndicadorUpdate(BaseModel):
    nome: Optional[str] = None
    unidade: Optional[str] = None
    meta: Optional[Decimal] = None
    valor_actual: Optional[Decimal] = None
    periodo_referencia: Optional[Trimestre] = None
    fonte_dados: Optional[str] = None


class Indicador(IndicadorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjetoSimple(BaseModel):
    id: int
    nome: str
    
    class Config:
        from_attributes = True


class IndicadorResponse(IndicadorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    projeto: Optional[ProjetoSimple] = None

    class Config:
        from_attributes = True
