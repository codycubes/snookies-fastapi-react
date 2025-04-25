from pydantic import BaseModel, conlist
from typing import List, Optional
from datetime import datetime
from models.tournament import TournamentType, MatchStatus, TournamentStatus
from schemas.user import User

class UserInTournament(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class TournamentBase(BaseModel):
    name: str
    tournament_type: TournamentType

class TournamentCreate(TournamentBase):
    player_usernames: conlist(str, min_length=2)  # Ensure at least 2 players

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    tournament_type: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True

class Tournament(TournamentBase):
    id: int
    created_at: datetime
    status: TournamentStatus
    created_by_id: int
    created_by: Optional[UserInTournament]
    players: List[UserInTournament] = []

    class Config:
        from_attributes = True

class MatchBase(BaseModel):
    tournament_id: int
    player1_id: int
    player2_id: int
    match_date: datetime
    is_home_game: bool

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    score_player1: int
    score_player2: int
    winner_id: int

class Match(MatchBase):
    id: int
    winner_id: Optional[int] = None
    status: MatchStatus
    score_player1: Optional[int] = None
    score_player2: Optional[int] = None
    player1: User
    player2: User
    winner: Optional[User] = None

    class Config:
        from_attributes = True 