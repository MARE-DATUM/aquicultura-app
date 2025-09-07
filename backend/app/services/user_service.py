from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.services.audit_service import AuditService
from typing import Optional, List
from fastapi import HTTPException, status


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)
    
    def create_user(self, user_data: UserCreate, created_by_user_id: Optional[int] = None) -> User:
        """Cria novo utilizador"""
        # Verifica se email já existe
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Cria utilizador
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            role=user_data.role,
            is_active=user_data.is_active
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=created_by_user_id,
            action="CREATE",
            entity="User",
            entity_id=db_user.id,
            details=f"Created user {db_user.email} with role {db_user.role}"
        )
        
        return db_user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Obtém utilizador por ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Obtém utilizador por email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Lista utilizadores"""
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def update_user(self, user_id: int, user_data: UserUpdate, updated_by_user_id: Optional[int] = None) -> Optional[User]:
        """Atualiza utilizador"""
        db_user = self.get_user_by_id(user_id)
        if not db_user:
            return None
        
        # Atualiza campos fornecidos
        update_data = user_data.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        self.db.commit()
        self.db.refresh(db_user)
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=updated_by_user_id,
            action="UPDATE",
            entity="User",
            entity_id=user_id,
            details=f"Updated user {db_user.email}"
        )
        
        return db_user
    
    def delete_user(self, user_id: int, deleted_by_user_id: Optional[int] = None) -> bool:
        """Elimina utilizador (soft delete)"""
        db_user = self.get_user_by_id(user_id)
        if not db_user:
            return False
        
        # Soft delete - desativa utilizador
        db_user.is_active = False
        self.db.commit()
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=deleted_by_user_id,
            action="DELETE",
            entity="User",
            entity_id=user_id,
            details=f"Deactivated user {db_user.email}"
        )
        
        return True
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Autentica utilizador"""
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def change_password(self, user_id: int, old_password: str, new_password: str, changed_by_user_id: Optional[int] = None) -> bool:
        """Altera senha do utilizador"""
        db_user = self.get_user_by_id(user_id)
        if not db_user:
            return False
        
        if not verify_password(old_password, db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )
        
        db_user.hashed_password = get_password_hash(new_password)
        self.db.commit()
        
        # Regista auditoria
        self.audit_service.log_action(
            user_id=changed_by_user_id,
            action="UPDATE",
            entity="User",
            entity_id=user_id,
            details="Password changed"
        )
        
        return True
