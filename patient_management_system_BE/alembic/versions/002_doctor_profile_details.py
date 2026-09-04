"""doctor profile details

Revision ID: 002_doctor_profile_details
Revises: 001_initial_schema
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa


revision = "002_doctor_profile_details"
down_revision = "001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("doctors", sa.Column("phone", sa.String(length=32), nullable=True))
    op.add_column("doctors", sa.Column("hospital", sa.String(length=160), nullable=True))
    op.add_column("doctors", sa.Column("registration_number", sa.String(length=80), nullable=True))
    op.add_column("doctors", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("doctors", sa.Column("experience_years", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("doctors", sa.Column("consultation_fee", sa.Integer(), nullable=True))
    op.add_column("doctors", sa.Column("room_number", sa.String(length=80), nullable=True))
    op.add_column("doctors", sa.Column("rating", sa.Float(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("doctors", "rating")
    op.drop_column("doctors", "room_number")
    op.drop_column("doctors", "consultation_fee")
    op.drop_column("doctors", "experience_years")
    op.drop_column("doctors", "bio")
    op.drop_column("doctors", "registration_number")
    op.drop_column("doctors", "hospital")
    op.drop_column("doctors", "phone")
