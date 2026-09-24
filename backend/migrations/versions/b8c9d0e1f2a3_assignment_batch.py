"""several games can share one homework drop

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-09-24

"""
from alembic import op
import sqlalchemy as sa


revision = "b8c9d0e1f2a3"
down_revision = "a7b8c9d0e1f2"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("assignments", sa.Column("batch_id", sa.String(length=36), nullable=True))
    op.create_index("ix_assignments_batch_id", "assignments", ["batch_id"])


def downgrade():
    op.drop_index("ix_assignments_batch_id", table_name="assignments")
    op.drop_column("assignments", "batch_id")
