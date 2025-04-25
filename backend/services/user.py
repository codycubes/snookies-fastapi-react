from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user import User, UserRole
from schemas.user import UserCreate
from services.auth import get_password_hash, verify_password

def get_user_by_username(db: Session, username: str) -> User:
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Get all users with pagination."""
    print("Executing user query...")  # Debug log
    users = db.query(User).offset(skip).limit(limit).all()
    print(f"Query result: {len(users)} users found")  # Debug log
    return users

def create_user(db: Session, user: UserCreate, role: UserRole = UserRole.USER) -> User:
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    if get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=role.value
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> User:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user 