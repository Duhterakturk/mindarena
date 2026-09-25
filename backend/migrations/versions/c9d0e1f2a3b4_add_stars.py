"""star balance, ledger, and personal bests

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-09-25

"""
from alembic import op
import sqlalchemy as sa


revision = "c9d0e1f2a3b4"
down_revision = "b8c9d0e1f2a3"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("star_balance", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("stars_earned_total", sa.Integer(), nullable=False, server_default="0"))
    op.create_table(
        "star_ledger",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=16), nullable=False),
        sa.Column("attempt_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["attempt_id"], ["puzzle_attempts.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_star_ledger_user_id", "star_ledger", ["user_id"])
    op.create_index("ix_star_ledger_attempt_id", "star_ledger", ["attempt_id"])
    op.create_table(
        "personal_bests",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("game_slug", sa.String(length=64), nullable=False),
        sa.Column("difficulty", sa.String(length=16), nullable=False),
        sa.Column("best_seconds", sa.Integer(), nullable=False),
        sa.Column("achieved_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "game_slug", "difficulty", name="uq_personal_best"),
    )
    op.create_index("ix_personal_bests_user_id", "personal_bests", ["user_id"])


def downgrade():
    op.drop_index("ix_personal_bests_user_id", table_name="personal_bests")
    op.drop_table("personal_bests")
    op.drop_index("ix_star_ledger_attempt_id", table_name="star_ledger")
    op.drop_index("ix_star_ledger_user_id", table_name="star_ledger")
    op.drop_table("star_ledger")
    op.drop_column("users", "stars_earned_total")
    op.drop_column("users", "star_balance")
