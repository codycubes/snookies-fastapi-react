from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services import user as user_service
from schemas.user import User

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all users. This endpoint is public."""
    print("Fetching users from database...")  # Debug log
    users = user_service.get_users(db, skip=skip, limit=limit)
    print(f"Found {len(users)} users:", [u.username for u in users])  # Debug log
    return users 