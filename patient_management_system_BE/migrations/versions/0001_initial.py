"""initial schema"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None
role = sa.Enum("patient", "doctor", name="role")
appointment_status = sa.Enum("booked", "cancelled", "completed", name="appointment_status")


def upgrade():
    op.create_table("users", sa.Column("id", sa.Integer, primary_key=True), sa.Column("name", sa.String(120), nullable=False), sa.Column("email", sa.String(255), nullable=False), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("role", role, nullable=False), sa.Column("specialty", sa.String(120)), sa.Column("active", sa.Boolean, nullable=False, server_default=sa.true()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.UniqueConstraint("email"))
    op.create_index("ix_users_email", "users", ["email"]); op.create_index("ix_users_specialty", "users", ["specialty"])
    op.create_table("availability", sa.Column("id", sa.Integer, primary_key=True), sa.Column("doctor_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("weekday", sa.Integer, nullable=False), sa.Column("start_time", sa.Time, nullable=False), sa.Column("end_time", sa.Time, nullable=False), sa.Column("slot_minutes", sa.Integer, nullable=False, server_default="30"))
    op.create_index("ix_availability_doctor_weekday", "availability", ["doctor_id", "weekday"])
    op.create_table("appointments", sa.Column("id", sa.Integer, primary_key=True), sa.Column("patient_id", sa.Integer, sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False), sa.Column("doctor_id", sa.Integer, sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False), sa.Column("slot_time", sa.DateTime(timezone=True), nullable=False), sa.Column("status", appointment_status, nullable=False, server_default="booked"), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_appointments_patient_id", "appointments", ["patient_id"]); op.create_index("ix_appointments_doctor_id", "appointments", ["doctor_id"]); op.create_index("ix_appointments_slot_time", "appointments", ["slot_time"])
    op.create_index("uq_booked_doctor_slot", "appointments", ["doctor_id", "slot_time"], unique=True, postgresql_where=sa.text("status = 'booked'"))


def downgrade():
    op.drop_table("appointments"); op.drop_table("availability"); op.drop_table("users")
    appointment_status.drop(op.get_bind()); role.drop(op.get_bind())

