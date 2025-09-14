"""Add mobile_number column to users table

Revision ID: 999999999999
Revises: 
Create Date: 2025-09-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '999999999999'
down_revision = 'e292113a3391'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('mobile_number', sa.String(length=20), nullable=True, index=True))


def downgrade():
    op.drop_column('users', 'mobile_number')
