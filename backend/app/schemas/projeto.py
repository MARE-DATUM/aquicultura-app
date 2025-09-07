from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal
from app.models.projeto import TipoProjeto, FonteFinanciamento, EstadoProjeto


class ProjetoBase(BaseModel):
    nome: str
    provincia_id: int
    tipo: TipoProjeto
    fonte_financiamento: FonteFinanciamento
    estado: EstadoProjeto = EstadoProjeto.PLANEADO
    responsavel: str
    orcamento_previsto_kz: Decimal
    orcamento_executado_kz: Decimal = Decimal('0')
    data_inicio_prevista: datetime
    data_fim_prevista: datetime
    descricao: Optional[str] = None


class ProjetoCreate(ProjetoBase):
    pass


class ProjetoUpdate(BaseModel):
    nome: Optional[str] = None
    provincia_id: Optional[int] = None
    tipo: Optional[TipoProjeto] = None
    fonte_financiamento: Optional[FonteFinanciamento] = None
    estado: Optional[EstadoProjeto] = None
    responsavel: Optional[str] = None
    orcamento_previsto_kz: Optional[Decimal] = None
    orcamento_executado_kz: Optional[Decimal] = None
    data_inicio_prevista: Optional[datetime] = None
    data_fim_prevista: Optional[datetime] = None
    descricao: Optional[str] = None


class Projeto(ProjetoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProvinciaSimple(BaseModel):
    id: int
    nome: str
    
    class Config:
        from_attributes = True


class ProjetoResponse(BaseModel):
    id: int
    nome: str
    provincia_id: int
    tipo: TipoProjeto
    fonte_financiamento: FonteFinanciamento
    estado: EstadoProjeto
    responsavel: str
    orcamento_previsto_kz: Decimal
    orcamento_executado_kz: Decimal
    data_inicio_prevista: datetime
    data_fim_prevista: datetime
    descricao: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    provincia: Optional[ProvinciaSimple] = None

    class Config:
        from_attributes = True


