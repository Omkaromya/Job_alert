"""Add mobile OTP fields to users table

Revision ID: a1b2c3d4e5f6
Revises: 999999999999
Create Date: 2025-09-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '999999999999'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('mobile_otp', sa.String(length=6), nullable=True))
    op.add_column('users', sa.Column('mobile_otp_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('mobile_password_reset_otp', sa.String(length=6), nullable=True))
    op.add_column('users', sa.Column('mobile_password_reset_otp_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_column('users', 'mobile_password_reset_otp_expires_at')
    op.drop_column('users', 'mobile_password_reset_otp')
    op.drop_column('users', 'mobile_otp_expires_at')
    op.drop_column('users', 'mobile_otp')
