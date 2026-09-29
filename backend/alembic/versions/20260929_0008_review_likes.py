"""Persist review likes with uniqueness and cascading cleanup."""

import sqlalchemy as sa

from alembic import op

revision = "20260929_0008"
down_revision = "20260920_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "review_likes",
        sa.Column("review_id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["review_id"], ["famtree.resenas.codigo_resena"], ondelete="CASCADE", onupdate="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["famtree.usuarios.codigo_usuario"], ondelete="CASCADE", onupdate="CASCADE"
        ),
        sa.PrimaryKeyConstraint("review_id", "user_id"),
        schema="famtree",
    )
    op.create_index("ix_review_likes_user", "review_likes", ["user_id"], schema="famtree")
    op.execute("""DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'famtree_app') THEN
        GRANT SELECT, INSERT, DELETE ON famtree.review_likes TO famtree_app;
    END IF; END $$""")


def downgrade() -> None:
    op.drop_table("review_likes", schema="famtree")
