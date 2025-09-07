from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Enum, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class Periodo5W2H(str, enum.Enum):
    PERIODO_0_6 = "0-6"
    PERIODO_7_12 = "7-12"
    PERIODO_13_18 = "13-18"


class Eixo5W2H(Base):
    __tablename__ = "eixos_5w2h"

    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    what = Column(Text, nullable=False)  # O que
    why = Column(Text, nullable=False)   # Porquê
    where = Column(Text, nullable=False) # Onde
    when = Column(Text, nullable=False)  # Quando
    who = Column(Text, nullable=False)   # Quem
    how = Column(Text, nullable=False)   # Como
    how_much_kz = Column(Numeric(15, 2), nullable=False)  # Quanto
    marcos = Column(JSON, nullable=True)  # Marcos (lista JSON)
    periodo = Column(Enum(Periodo5W2H), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projeto = relationship("Projeto", back_populates="eixos_5w2h")
