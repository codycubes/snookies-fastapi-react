from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services import tournament as tournament_service
from services.auth import get_current_user
from schemas.tournament import Tournament, TournamentCreate, Match, MatchUpdate, TournamentUpdate
from models.user import User

router = APIRouter()

# Public endpoints - no authentication required
@router.get("/", response_model=List[Tournament])
async def get_tournaments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all tournaments with pagination. This endpoint is public."""
    return tournament_service.get_tournaments(db, skip=skip, limit=limit)

@router.post("/", response_model=Tournament)
async def create_tournament(
    tournament: TournamentCreate,
    db: Session = Depends(get_db)
):
    """Create a new tournament. No authentication required."""
    return tournament_service.create_tournament(db, tournament, 1)  # Using default user ID

@router.get("/ongoing", response_model=List[Tournament])
async def get_ongoing_tournaments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all ongoing tournaments."""
    return tournament_service.get_ongoing_tournaments(db, skip=skip, limit=limit)

# Routes with path parameters
@router.get("/{tournament_id}", response_model=Tournament)
async def get_tournament(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific tournament by ID. This endpoint is public."""
    return tournament_service.get_tournament(db, tournament_id)

@router.get("/{tournament_id}/matches", response_model=List[Match])
async def get_tournament_matches(
    tournament_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all matches for a specific tournament. Requires authentication."""
    return tournament_service.get_tournament_matches(db, tournament_id)

@router.put("/matches/{match_id}", response_model=Match)
async def update_match_result(
    match_id: int,
    match_update: MatchUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the result of a match. Requires authentication."""
    return tournament_service.update_match_result(
        db,
        match_id,
        match_update.score_player1,
        match_update.score_player2,
        match_update.winner_id
    )

@router.post("/{tournament_id}/join", response_model=Tournament)
async def join_tournament(
    tournament_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a tournament as a player."""
    return tournament_service.join_tournament(db, tournament_id, current_user.id)

@router.put("/{tournament_id}", response_model=Tournament)
async def update_tournament(
    tournament_id: int,
    tournament_update: TournamentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a tournament. Only the host can update the tournament."""
    tournament = tournament_service.get_tournament(db, tournament_id)
    
    if not tournament_service.is_tournament_host(tournament, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the tournament host can update this tournament"
        )
    
    return tournament_service.update_tournament(db, tournament_id, tournament_update) 