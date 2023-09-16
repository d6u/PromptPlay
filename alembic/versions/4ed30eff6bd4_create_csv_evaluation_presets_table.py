"""Create csv_evaluation_presets table

Revision ID: 4ed30eff6bd4
Revises: c50c0fa59555
Create Date: 2023-09-16 10:21:48.017095

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "4ed30eff6bd4"
down_revision: Union[str, None] = "c50c0fa59555"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "csv_evaluation_presets",
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("csv_content", sa.String(), nullable=False),
        sa.Column(
            "config_content",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.FetchedValue(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.FetchedValue(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_csv_evaluation_presets_owner_id"),
        "csv_evaluation_presets",
        ["owner_id"],
        unique=False,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(
        op.f("ix_csv_evaluation_presets_owner_id"),
        table_name="csv_evaluation_presets",
    )
    op.drop_table("csv_evaluation_presets")
    # ### end Alembic commands ###
