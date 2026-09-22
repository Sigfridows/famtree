"""Retain revoked administrator accounts when assigning a replacement (HU39)."""

import sqlalchemy as sa

from alembic import op

revision = "20260920_0005"
down_revision = "20260920_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_usuarios_asignacion", "usuarios", schema="famtree")
    op.create_check_constraint(
        "ck_usuarios_asignacion",
        "usuarios",
        "rol = 'ADMIN_ASILO' OR codigo_asilo_asignado IS NULL",
        schema="famtree",
    )
    op.add_column(
        "usuarios", sa.Column("password_changed_at", sa.DateTime(timezone=True)), schema="famtree"
    )


def downgrade() -> None:
    # Existing unassigned admins must be resolved explicitly before downgrading.
    op.drop_constraint("ck_usuarios_asignacion", "usuarios", schema="famtree")
    op.create_check_constraint(
        "ck_usuarios_asignacion",
        "usuarios",
        "(rol = 'ADMIN_ASILO' AND codigo_asilo_asignado IS NOT NULL) OR "
        "(rol <> 'ADMIN_ASILO' AND codigo_asilo_asignado IS NULL)",
        schema="famtree",
    )
    op.drop_column("usuarios", "password_changed_at", schema="famtree")
