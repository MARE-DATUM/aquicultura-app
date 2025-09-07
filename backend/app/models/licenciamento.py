from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class StatusLicenciamento(str, enum.Enum):
    PENDENTE = "PENDENTE"
    EM_ANALISE = "EM_ANALISE"
    APROVADO = "APROVADO"
    NEGADO = "NEGADO"


class EntidadeResponsavel(str, enum.Enum):
    IPA = "IPA"
    DNA = "DNA"
    DNRM = "DNRM"


class Licenciamento(Base):
    __tablename__ = "licenciamentos"

    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    status = Column(Enum(StatusLicenciamento), nullable=False, default=StatusLicenciamento.PENDENTE)
    entidade_responsavel = Column(Enum(EntidadeResponsavel), nullable=False)
    data_submissao = Column(DateTime(timezone=True), nullable=False)
    data_decisao = Column(DateTime(timezone=True), nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projeto = relationship("Projeto", back_populates="licenciamentos")
