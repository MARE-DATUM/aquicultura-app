from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.licenciamento import StatusLicenciamento, EntidadeResponsavel


class LicenciamentoBase(BaseModel):
    projeto_id: int
    status: StatusLicenciamento = StatusLicenciamento.PENDENTE
    entidade_responsavel: EntidadeResponsavel
    data_submissao: datetime
    data_decisao: Optional[datetime] = None
    observacoes: Optional[str] = None


class LicenciamentoCreate(LicenciamentoBase):
    pass


class LicenciamentoUpdate(BaseModel):
    status: Optional[StatusLicenciamento] = None
    entidade_responsavel: Optional[EntidadeResponsavel] = None
    data_submissao: Optional[datetime] = None
    data_decisao: Optional[datetime] = None
    observacoes: Optional[str] = None


class Licenciamento(LicenciamentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LicenciamentoResponse(LicenciamentoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    projeto: Optional[dict] = None

    class Config:
        from_attributes = True
