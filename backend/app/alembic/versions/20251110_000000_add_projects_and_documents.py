"""add projects and documents tables

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2025-11-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd4e5f6g7h8i9'
down_revision = 'c3d4e5f6g7h8'
branch_labels = None
depends_on = None


def upgrade():
    # Create project table
    op.create_table(
        'project',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('system_prompt', sa.String(), nullable=True),
        sa.Column('max_context_tokens', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create document table
    op.create_table(
        'document',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('project_id', sa.Uuid(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('document_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('total_chunks', sa.Integer(), nullable=False),
        sa.Column('processed_chunks', sa.Integer(), nullable=False),
        sa.Column('estimated_tokens', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.String(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.Column('processing_started_at', sa.DateTime(), nullable=True),
        sa.Column('processing_completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Rename analysis_id to project_id in chatconversation table
    op.alter_column('chatconversation', 'analysis_id',
                    new_column_name='project_id',
                    existing_type=sa.Uuid(),
                    nullable=True)

    # Add foreign key constraint for project_id (if it doesn't exist)
    # Note: The column was nullable before, so we keep it nullable
    op.create_foreign_key(
        'fk_chatconversation_project_id_project',
        'chatconversation',
        'project',
        ['project_id'],
        ['id'],
        ondelete='CASCADE'
    )

    # Add new columns to chatconversation for title generation
    op.add_column('chatconversation', sa.Column('auto_generated_title', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('chatconversation', sa.Column('title_generation_task_id', sa.String(), nullable=True))


def downgrade():
    # Remove title generation columns from chatconversation
    op.drop_column('chatconversation', 'title_generation_task_id')
    op.drop_column('chatconversation', 'auto_generated_title')

    # Remove foreign key constraint
    op.drop_constraint('fk_chatconversation_project_id_project', 'chatconversation', type_='foreignkey')

    # Rename project_id back to analysis_id
    op.alter_column('chatconversation', 'project_id',
                    new_column_name='analysis_id',
                    existing_type=sa.Uuid(),
                    nullable=True)

    # Drop document table
    op.drop_table('document')

    # Drop project table
    op.drop_table('project')
