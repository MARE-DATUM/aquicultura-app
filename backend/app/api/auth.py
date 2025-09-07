from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserLogin, Token, User
from app.services.user_service import UserService
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.rate_limiter import check_login_rate_limit, record_login_attempt
from app.core.deps import get_current_active_user
from app.models.audit_log import AcaoAudit
from datetime import timedelta
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """Autentica utilizador e retorna tokens"""
    # Verifica rate limiting
    client_ip = request.client.host
    if not check_login_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Autentica utilizador
    user_service = UserService(db)
    user = user_service.authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        record_login_attempt(client_ip, False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        record_login_attempt(client_ip, False)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Regista sucesso
    record_login_attempt(client_ip, True)
    
    # Atualiza último login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Regista auditoria
    audit_service = UserService(db).audit_service
    audit_service.log_action(
        user_id=user.id,
        action=AcaoAudit.LOGIN,
        ip=client_ip,
        details=f"User {user.email} logged in"
    )
    
    # Cria tokens
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Renova token de acesso usando refresh token"""
    payload = verify_token(refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    email = payload.get("sub")
    user_service = UserService(db)
    user = user_service.get_user_by_email(email)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Cria novo access token
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Logout do utilizador"""
    # Regista auditoria
    audit_service = UserService(db).audit_service
    audit_service.log_action(
        user_id=current_user.id,
        action=AcaoAudit.LOGOUT,
        details=f"User {current_user.email} logged out"
    )
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Obtém dados do utilizador atual"""
    return current_user
