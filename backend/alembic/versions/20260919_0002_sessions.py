"""Revocable opaque sessions and serialized login throttling."""

import sqlalchemy as sa

from alembic import op

revision = "20260919_0002"
down_revision = "20260904_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sessions",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column(
            "user_id",
            sa.BigInteger(),
            sa.ForeignKey("famtree.usuarios.codigo_usuario", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        schema="famtree",
    )
    op.create_index("ix_famtree_sessions_user_id", "sessions", ["user_id"], schema="famtree")
    op.create_index("ix_famtree_sessions_expires_at", "sessions", ["expires_at"], schema="famtree")
    op.create_table(
        "login_guards",
        sa.Column("username", sa.String(16), primary_key=True),
        sa.Column("failures", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("locked_until", sa.DateTime(timezone=True)),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        schema="famtree",
    )


def downgrade() -> None:
    op.drop_table("sessions", schema="famtree")
    op.drop_table("login_guards", schema="famtree")
