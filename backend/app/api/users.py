from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.user import User, UserCreate, UserUpdate
from app.services.user_service import UserService
from app.core.deps import get_current_active_user, require_root
from app.models.user import UserRole

router = APIRouter()


@router.post("/", response_model=User)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Cria novo utilizador (apenas ROOT)"""
    user_service = UserService(db)
    return user_service.create_user(user_data, current_user.id)


@router.get("/", response_model=List[User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Lista utilizadores (apenas ROOT)"""
    user_service = UserService(db)
    return user_service.get_users(skip=skip, limit=limit)


@router.get("/{user_id}", response_model=User)
def read_user(
    user_id: int,
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Obtém utilizador por ID (apenas ROOT)"""
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Atualiza utilizador (apenas ROOT)"""
    user_service = UserService(db)
    user = user_service.update_user(user_id, user_data, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_root),
    db: Session = Depends(get_db)
):
    """Elimina utilizador (apenas ROOT)"""
    user_service = UserService(db)
    success = user_service.delete_user(user_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


@router.post("/{user_id}/change-password")
def change_password(
    user_id: int,
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Altera senha do utilizador"""
    # Utilizador só pode alterar sua própria senha, exceto ROOT
    if current_user.role != UserRole.ROOT and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user_service = UserService(db)
    success = user_service.change_password(user_id, old_password, new_password, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Password changed successfully"}
