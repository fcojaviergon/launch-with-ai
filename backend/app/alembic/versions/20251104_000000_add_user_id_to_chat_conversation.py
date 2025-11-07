"""add user_id to chat_conversation

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2025-11-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6g7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Add user_id column to chatconversation table
    op.add_column('chatconversation', sa.Column('user_id', sa.Uuid(), nullable=True))

    # Add foreign key constraint
    op.create_foreign_key(
        'fk_chatconversation_user_id_user',
        'chatconversation',
        'user',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )

    # Note: In production, you would need to populate user_id for existing rows
    # before making it non-nullable. For new installations, this is fine.
    # If you have existing data, run:
    # UPDATE chatconversation SET user_id = (SELECT id FROM "user" LIMIT 1) WHERE user_id IS NULL;
    # Then: op.alter_column('chatconversation', 'user_id', nullable=False)


def downgrade():
    # Remove foreign key constraint
    op.drop_constraint('fk_chatconversation_user_id_user', 'chatconversation', type_='foreignkey')

    # Remove user_id column
    op.drop_column('chatconversation', 'user_id')
