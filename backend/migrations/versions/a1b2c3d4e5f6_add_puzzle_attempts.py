"""add puzzle attempts

Revision ID: a1b2c3d4e5f6
Revises: 2c73720e9861
Create Date: 2026-09-22 13:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "a1b2c3d4e5f6"
down_revision = "2c73720e9861"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "puzzle_attempts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("game_id", sa.Integer(), nullable=False),
        sa.Column("difficulty", sa.String(length=16), nullable=False),
        sa.Column("public_json", sa.Text(), nullable=False),
        sa.Column("proof_json", sa.Text(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("consumed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["game_id"], ["games.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("puzzle_attempts", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_puzzle_attempts_game_id"), ["game_id"], unique=False)
        batch_op.create_index(batch_op.f("ix_puzzle_attempts_user_id"), ["user_id"], unique=False)


def downgrade():
    with op.batch_alter_table("puzzle_attempts", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_puzzle_attempts_user_id"))
        batch_op.drop_index(batch_op.f("ix_puzzle_attempts_game_id"))
    op.drop_table("puzzle_attempts")
