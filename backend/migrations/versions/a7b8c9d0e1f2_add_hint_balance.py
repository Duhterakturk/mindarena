"""hint balance on the account, one earn per solved puzzle

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-09-23

"""
from alembic import op
import sqlalchemy as sa


revision = "a7b8c9d0e1f2"
down_revision = "f6a7b8c9d0e1"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("hint_balance", sa.Integer(), nullable=False, server_default="3"))
    op.add_column(
        "puzzle_attempts",
        sa.Column("hint_earned", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade():
    op.drop_column("puzzle_attempts", "hint_earned")
    op.drop_column("users", "hint_balance")
