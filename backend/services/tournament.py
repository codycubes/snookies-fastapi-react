from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
import random
from datetime import datetime, timedelta
from models.tournament import Tournament, Match, TournamentType, MatchStatus, TournamentStatus
from models.user import User
from schemas.tournament import TournamentCreate
from services.user import get_user_by_username

def create_tournament(db: Session, tournament: TournamentCreate, creator_id: int) -> Tournament:
    print(f"Creating tournament with data: {tournament}")  # Debug log
    # Verify all players exist
    players = []
    for username in tournament.player_usernames:
        print(f"Looking for player: {username}")  # Debug log
        player = get_user_by_username(db, username)
        if not player:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {username} not found"
            )
        players.append(player)

    if len(players) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament needs at least 2 players"
        )

    print(f"Found all players: {[p.username for p in players]}")  # Debug log
    
    db_tournament = Tournament(
        name=tournament.name,
        tournament_type=tournament.tournament_type,
        created_by_id=creator_id,
        players=players
    )
    
    try:
        db.add(db_tournament)
        db.commit()
        db.refresh(db_tournament)
    except Exception as e:
        print(f"Error creating tournament: {str(e)}")  # Debug log
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating tournament: {str(e)}"
        )

    # Generate matches based on tournament type
    if tournament.tournament_type == TournamentType.KNOCKOUT:
        _generate_knockout_matches(db, db_tournament, players)
    else:  # LEAGUE
        _generate_league_matches(db, db_tournament, players)

    return db_tournament

def _generate_knockout_matches(db: Session, tournament: Tournament, players: List[User]):
    # Shuffle players randomly
    random.shuffle(players)
    
    # Create first round matches
    match_date = datetime.utcnow() + timedelta(days=7)
    for i in range(0, len(players), 2):
        if i + 1 < len(players):
            match = Match(
                tournament_id=tournament.id,
                player1_id=players[i].id,
                player2_id=players[i + 1].id,
                match_date=match_date,
                is_home_game=True
            )
            db.add(match)

    db.commit()

def _generate_league_matches(db: Session, tournament: Tournament, players: List[User]):
    match_date = datetime.utcnow() + timedelta(days=7)
    
    # Generate home and away matches for each pair of players
    for i in range(len(players)):
        for j in range(i + 1, len(players)):
            # Home match
            home_match = Match(
                tournament_id=tournament.id,
                player1_id=players[i].id,
                player2_id=players[j].id,
                match_date=match_date,
                is_home_game=True
            )
            db.add(home_match)
            
            # Away match
            away_match = Match(
                tournament_id=tournament.id,
                player1_id=players[j].id,
                player2_id=players[i].id,
                match_date=match_date + timedelta(days=7),
                is_home_game=False
            )
            db.add(away_match)
            
            match_date += timedelta(days=14)  # Schedule next pair two weeks later

    db.commit()

def get_tournament(db: Session, tournament_id: int) -> Tournament:
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    return tournament

def get_tournaments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tournament).offset(skip).limit(limit).all()

def get_tournament_matches(db: Session, tournament_id: int):
    return db.query(Match).filter(Match.tournament_id == tournament_id).all()

def update_match_result(db: Session, match_id: int, score_player1: int, score_player2: int, winner_id: int):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    if match.status == MatchStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Match already completed"
        )
    
    if winner_id != match.player1_id and winner_id != match.player2_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Winner must be one of the match players"
        )
    
    match.score_player1 = score_player1
    match.score_player2 = score_player2
    match.winner_id = winner_id
    match.status = MatchStatus.COMPLETED
    
    db.commit()
    db.refresh(match)
    return match

def get_ongoing_tournaments(db: Session, skip: int = 0, limit: int = 100):
    """Get tournaments with 'ongoing' status."""
    return db.query(Tournament).filter(Tournament.status == TournamentStatus.ONGOING).offset(skip).limit(limit).all()

def join_tournament(db: Session, tournament_id: int, user_id: int):
    """Add a player to a tournament."""
    tournament = get_tournament(db, tournament_id)
    user = db.query(User).filter(User.id == user_id).first()
    
    if not tournament or not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament or user not found"
        )
    
    # Check if player is already in the tournament
    if user in tournament.players:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already in this tournament"
        )
    
    tournament.players.append(user)
    db.commit()
    db.refresh(tournament)
    return tournament

def is_tournament_host(tournament: Tournament, user_id: int) -> bool:
    """Check if the user is the host (creator) of the tournament."""
    return tournament.created_by_id == user_id 