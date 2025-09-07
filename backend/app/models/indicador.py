from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class Trimestre(str, enum.Enum):
    T1 = "T1"
    T2 = "T2"
    T3 = "T3"
    T4 = "T4"


class Indicador(Base):
    __tablename__ = "indicadores"

    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    nome = Column(String, nullable=False)
    unidade = Column(String, nullable=False)  # Ex: toneladas, famílias, empregos, %
    meta = Column(Numeric(15, 2), nullable=False)
    valor_actual = Column(Numeric(15, 2), default=0)
    periodo_referencia = Column(Enum(Trimestre), nullable=False)
    fonte_dados = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projeto = relationship("Projeto", back_populates="indicadores")
