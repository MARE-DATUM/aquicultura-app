from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from app.models.eixo_5w2h import Periodo5W2H


class Eixo5W2HBase(BaseModel):
    projeto_id: int
    what: str
    why: str
    where: str
    when: str
    who: str
    how: str
    how_much_kz: Decimal
    marcos: Optional[List[Dict[str, Any]]] = None
    periodo: Periodo5W2H


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


class Eixo5W2HResponse(Eixo5W2HBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    projeto: Optional[dict] = None

    class Config:
        from_attributes = True
