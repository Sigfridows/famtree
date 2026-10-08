"""Add a validated property type to asylum centers."""

import sqlalchemy as sa

from alembic import op

revision = "20261004_0009"
down_revision = "20260929_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "asilos",
        sa.Column("tipo_propiedad", sa.String(length=20), nullable=False, server_default="CASA"),
        schema="famtree",
    )
    op.create_check_constraint(
        "ck_asilos_tipo_propiedad",
        "asilos",
        "tipo_propiedad IN ('CASA', 'APARTAMENTO', 'VILLA', 'GERIATRICO')",
        schema="famtree",
    )
    op.create_index("ix_asilos_tipo_propiedad", "asilos", ["tipo_propiedad"], schema="famtree")
    op.add_column(
        "bloqueos_usuario",
        sa.Column("motivo_desbloqueo", sa.String(length=300), nullable=True),
        schema="famtree",
    )


def downgrade() -> None:
    op.drop_index("ix_asilos_tipo_propiedad", table_name="asilos", schema="famtree")
    op.drop_constraint("ck_asilos_tipo_propiedad", "asilos", schema="famtree")
    op.drop_column("asilos", "tipo_propiedad", schema="famtree")
    op.drop_column("bloqueos_usuario", "motivo_desbloqueo", schema="famtree")
