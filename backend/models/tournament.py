from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Table, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class TournamentType(str, enum.Enum):
    LEAGUE = "league"
    KNOCKOUT = "knockout"

class TournamentStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"

tournament_players = Table(
    'tournament_players',
    Base.metadata,
    Column('tournament_id', Integer, ForeignKey('tournaments.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    tournament_type = Column(Enum(TournamentType))
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(TournamentStatus), default=TournamentStatus.UPCOMING)
    
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_by = relationship("User", back_populates="created_tournaments", foreign_keys=[created_by_id])
    players = relationship("User", secondary=tournament_players, backref="tournaments_joined")
    matches = relationship("Match", back_populates="tournament")

class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey('tournaments.id'))
    player1_id = Column(Integer, ForeignKey('users.id'))
    player2_id = Column(Integer, ForeignKey('users.id'))
    winner_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    status = Column(Enum(MatchStatus), default=MatchStatus.PENDING)
    match_date = Column(DateTime)
    is_home_game = Column(Boolean, default=True)  # True for home game, False for away game
    score_player1 = Column(Integer, nullable=True)
    score_player2 = Column(Integer, nullable=True)

    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("User", foreign_keys=[player1_id])
    player2 = relationship("User", foreign_keys=[player2_id])
    winner = relationship("User", foreign_keys=[winner_id]) 