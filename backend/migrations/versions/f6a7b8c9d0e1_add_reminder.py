"""add reminder word on users

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-09-23

"""
from alembic import op
import sqlalchemy as sa


revision = "f6a7b8c9d0e1"
down_revision = "e5f6a7b8c9d0"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("reminder_hash", sa.String(length=255), nullable=True))


def downgrade():
    op.drop_column("users", "reminder_hash")
