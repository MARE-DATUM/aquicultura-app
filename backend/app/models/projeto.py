from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class TipoProjeto(str, enum.Enum):
    COMUNITARIO = "COMUNITARIO"
    EMPRESARIAL = "EMPRESARIAL"


class FonteFinanciamento(str, enum.Enum):
    AFAP_2 = "AFAP-2"
    FADEPA = "FADEPA"
    FACRA = "FACRA"
    PRIVADO = "PRIVADO"


class EstadoProjeto(str, enum.Enum):
    PLANEADO = "PLANEADO"
    EM_EXECUCAO = "EM_EXECUCAO"
    CONCLUIDO = "CONCLUIDO"
    SUSPENSO = "SUSPENSO"


class Projeto(Base):
    __tablename__ = "projetos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, index=True)
    provincia_id = Column(Integer, ForeignKey("provincias.id"), nullable=False)
    tipo = Column(Enum(TipoProjeto), nullable=False)
    fonte_financiamento = Column(Enum(FonteFinanciamento), nullable=False)
    estado = Column(Enum(EstadoProjeto), nullable=False, default=EstadoProjeto.PLANEADO)
    responsavel = Column(String, nullable=False)
    orcamento_previsto_kz = Column(Numeric(15, 2), nullable=False)
    orcamento_executado_kz = Column(Numeric(15, 2), default=0)
    data_inicio_prevista = Column(DateTime(timezone=True), nullable=False)
    data_fim_prevista = Column(DateTime(timezone=True), nullable=False)
    descricao = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    provincia = relationship("Provincia", back_populates="projetos")
    eixos_5w2h = relationship("Eixo5W2H", back_populates="projeto")
    indicadores = relationship("Indicador", back_populates="projeto")
    licenciamentos = relationship("Licenciamento", back_populates="projeto")
