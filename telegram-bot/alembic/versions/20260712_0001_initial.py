"""Начальная схема: users, leads, pending_sync

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-12
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=False),
        sa.Column("username", sa.String(length=64), nullable=True),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("language", sa.String(length=2), nullable=False, server_default="ru"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "leads",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tg_user_id", sa.BigInteger(), nullable=False),
        sa.Column("tg_username", sa.String(length=64), nullable=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("contact", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=True),
        sa.Column("size", sa.String(length=40), nullable=True),
        sa.Column("budget", sa.String(length=60), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("language", sa.String(length=2), nullable=False, server_default="ru"),
        sa.Column("crm_status", sa.String(length=16), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_leads_tg_user_id", "leads", ["tg_user_id"])

    op.create_table(
        "pending_sync",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_error", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_pending_sync_lead_id", "pending_sync", ["lead_id"])


def downgrade() -> None:
    op.drop_index("ix_pending_sync_lead_id", table_name="pending_sync")
    op.drop_table("pending_sync")
    op.drop_index("ix_leads_tg_user_id", table_name="leads")
    op.drop_table("leads")
    op.drop_table("users")
