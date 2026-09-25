"""Aksesuar alımlarının yıldızını iade eder.

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-09-25

"""
from alembic import op


revision = "f2a3b4c5d6e7"
down_revision = "e1f2a3b4c5d6"
branch_labels = None
depends_on = None


def upgrade():
    from app.services.shop import refund_accessories

    refund_accessories(op.get_bind())


def downgrade():
    pass
