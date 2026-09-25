"""certificates

Revision ID: e1f2a3b4c5d6
Revises: d0e1f2a3b4c5
Create Date: 2026-09-25

"""
from alembic import op
import sqlalchemy as sa


revision = "e1f2a3b4c5d6"
down_revision = "d0e1f2a3b4c5"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "certificates",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("earned_at", sa.DateTime(), nullable=False),
        sa.Column("verify_code", sa.String(length=12), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "kind", name="uq_certificate_kind"),
        sa.UniqueConstraint("verify_code"),
    )
    op.create_index("ix_certificates_user_id", "certificates", ["user_id"])


def downgrade():
    op.drop_index("ix_certificates_user_id", table_name="certificates")
    op.drop_table("certificates")
