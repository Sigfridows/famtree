"""HU24 permits optional report details of up to 250 characters, including short text."""

from alembic import op

revision = "20260920_0006"
down_revision = "20260920_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_reportes_detalle", "reportes_resena", schema="famtree")
    op.create_check_constraint(
        "ck_reportes_detalle",
        "reportes_resena",
        "detalle IS NULL OR length(detalle) <= 250",
        schema="famtree",
    )


def downgrade() -> None:
    op.drop_constraint("ck_reportes_detalle", "reportes_resena", schema="famtree")
    op.create_check_constraint(
        "ck_reportes_detalle",
        "reportes_resena",
        "detalle IS NULL OR length(btrim(detalle)) BETWEEN 10 AND 250",
        schema="famtree",
    )
