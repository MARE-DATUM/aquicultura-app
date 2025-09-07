from pydantic import BaseModel, field_serializer
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

    @field_serializer('meta', 'valor_actual')
    def serialize_decimal_to_float(self, value: Decimal) -> float:
        """Converte Decimal para float para o frontend"""
        return float(value) if value is not None else 0.0

    class Config:
        from_attributes = True
