"""add tax_id tin rc to customers

Revision ID: 2b5c9d3e7f1a
Revises: 1da4b82e49bb
Create Date: 2026-01-15 15:57:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b5c9d3e7f1a'
down_revision: Union[str, Sequence[str], None] = '1da4b82e49bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new identifier tables for customers
    op.create_table('customers_tax_id',
    sa.Column('tax_id', sa.String(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('tax_id', name='_tax_id_uc'),
    sa.UniqueConstraint('tax_id', 'customer_id', name='_tax_id_customer_uc')
    )
    
    op.create_table('customers_tin',
    sa.Column('tin', sa.String(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('tin', name='_tin_uc'),
    sa.UniqueConstraint('tin', 'customer_id', name='_tin_customer_uc')
    )
    
    op.create_table('customers_rc',
    sa.Column('rc', sa.String(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('rc', name='_rc_uc'),
    sa.UniqueConstraint('rc', 'customer_id', name='_rc_customer_uc')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('customers_rc')
    op.drop_table('customers_tin')
    op.drop_table('customers_tax_id')
