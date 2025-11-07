"""make analysis_id nullable in chat_conversation

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2025-11-07 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6g7h8'
down_revision = 'b2c3d4e5f6g7'
branch_labels = None
depends_on = None


def upgrade():
    # Make analysis_id nullable in chatconversation table
    op.alter_column('chatconversation', 'analysis_id',
                    existing_type=sa.Uuid(),
                    nullable=True)


def downgrade():
    # Make analysis_id non-nullable again
    # Note: This will fail if there are rows with NULL analysis_id
    op.alter_column('chatconversation', 'analysis_id',
                    existing_type=sa.Uuid(),
                    nullable=False)
