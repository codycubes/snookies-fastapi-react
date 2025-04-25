"""Create base

Revision ID: b3871fbadd97
Revises: 
Create Date: 2025-04-11 12:06:53.944292

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b3871fbadd97'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial tables."""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('user', 'admin', name='userrole'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    
    # Create tournaments table
    op.create_table(
        'tournaments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('tournament_type', sa.Enum('league', 'knockout', name='tournamenttype'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('created_by_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tournaments_id', 'tournaments', ['id'], unique=False)
    op.create_index('ix_tournaments_name', 'tournaments', ['name'], unique=False)
    
    # Create tournament_players association table
    op.create_table(
        'tournament_players',
        sa.Column('tournament_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('tournament_id', 'user_id')
    )
    
    # Create matches table
    op.create_table(
        'matches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tournament_id', sa.Integer(), nullable=False),
        sa.Column('player1_id', sa.Integer(), nullable=False),
        sa.Column('player2_id', sa.Integer(), nullable=False),
        sa.Column('winner_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'completed', name='matchstatus'), nullable=False),
        sa.Column('match_date', sa.DateTime(), nullable=False),
        sa.Column('is_home_game', sa.Boolean(), nullable=False),
        sa.Column('score_player1', sa.Integer(), nullable=True),
        sa.Column('score_player2', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['player1_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['player2_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ),
        sa.ForeignKeyConstraint(['winner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_matches_id', 'matches', ['id'], unique=False)


def downgrade() -> None:
    """Remove all tables."""
    op.drop_index('ix_matches_id', 'matches')
    op.drop_table('matches')
    op.drop_table('tournament_players')
    op.drop_index('ix_tournaments_name', 'tournaments')
    op.drop_index('ix_tournaments_id', 'tournaments')
    op.drop_table('tournaments')
    op.drop_index('ix_users_id', 'users')
    op.drop_table('users')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS matchstatus')
    op.execute('DROP TYPE IF EXISTS tournamenttype')
    op.execute('DROP TYPE IF EXISTS userrole')
