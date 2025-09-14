from pydantic import BaseModel, validator, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from app.models.eixo_5w2h import Periodo5W2H


class Eixo5W2HBase(BaseModel):
    projeto_id: int = Field(..., gt=0, description="ID do projeto deve ser positivo")
    what: str = Field(..., min_length=1, max_length=1000, description="Descrição do que será feito")
    why: str = Field(..., min_length=1, max_length=1000, description="Justificativa do projeto")
    where: str = Field(..., min_length=1, max_length=500, description="Localização do projeto")
    when: str = Field(..., min_length=1, max_length=500, description="Cronograma do projeto")
    who: str = Field(..., min_length=1, max_length=500, description="Responsáveis pelo projeto")
    how: str = Field(..., min_length=1, max_length=1000, description="Metodologia do projeto")
    how_much_kz: Decimal = Field(..., gt=0, description="Orçamento deve ser positivo")
    marcos: Optional[List[Dict[str, Any]]] = None
    periodo: Periodo5W2H

    @validator('what', 'why', 'where', 'when', 'who', 'how')
    def validate_text_fields(cls, v):
        if not v or not v.strip():
            raise ValueError('Campo não pode estar vazio')
        return v.strip()

    @validator('how_much_kz')
    def validate_budget(cls, v):
        if v <= 0:
            raise ValueError('Orçamento deve ser maior que zero')
        return v

    @validator('marcos')
    def validate_marcos(cls, v):
        if v is not None:
            for marco in v:
                if not isinstance(marco, dict):
                    raise ValueError('Cada marco deve ser um objeto')
                required_fields = ['nome', 'data', 'status']
                for field in required_fields:
                    if field not in marco:
                        raise ValueError(f'Marco deve ter o campo {field}')
                if not marco['nome'] or not marco['nome'].strip():
                    raise ValueError('Nome do marco não pode estar vazio')
        return v


class Eixo5W2HCreate(Eixo5W2HBase):
    pass


class Eixo5W2HUpdate(BaseModel):
    what: Optional[str] = None
    why: Optional[str] = None
    where: Optional[str] = None
    when: Optional[str] = None
    who: Optional[str] = None
    how: Optional[str] = None
    how_much_kz: Optional[Decimal] = None
    marcos: Optional[List[Dict[str, Any]]] = None
    periodo: Optional[Periodo5W2H] = None


class Eixo5W2H(Eixo5W2HBase):
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


class Eixo5W2HResponse(Eixo5W2HBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    projeto: Optional[ProjetoSimple] = None

    class Config:
        from_attributes = True
