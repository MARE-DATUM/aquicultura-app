from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class AcaoAudit(str, enum.Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    IMPORT = "IMPORT"
    EXPORT = "EXPORT"
    STATUS_CHANGE = "STATUS_CHANGE"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable para ações do sistema
    papel = Column(String, nullable=True)  # Papel do utilizador no momento da ação
    acao = Column(Enum(AcaoAudit), nullable=False)
    entidade = Column(String, nullable=True)  # Nome da entidade afetada
    entidade_id = Column(Integer, nullable=True)  # ID da entidade afetada
    ip = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    detalhes = Column(Text, nullable=True)  # Detalhes adicionais da ação
    
    # Relationships
    user = relationship("User")
