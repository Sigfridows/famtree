"""Preserve moderation decisions independently of deleted reviews."""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "20260919_0003"
down_revision = "20260919_0002"
branch_labels = None
depends_on = None

OLD = """(tipo_evento = 'RESOLUCION_REPORTE' AND codigo_resena IS NOT NULL
AND codigo_asilo IS NULL) OR (tipo_evento <> 'RESOLUCION_REPORTE'
AND codigo_asilo IS NOT NULL AND codigo_resena IS NULL)"""
NEW = """(tipo_evento = 'RESOLUCION_REPORTE'
AND (codigo_resena IS NOT NULL OR resolution_snapshot IS NOT NULL)
AND codigo_asilo IS NULL) OR (tipo_evento <> 'RESOLUCION_REPORTE'
AND codigo_asilo IS NOT NULL AND codigo_resena IS NULL AND resolution_snapshot IS NULL)"""


def upgrade() -> None:
    op.create_table(
        "moderation_decisions",
        sa.Column("report_id", sa.BigInteger(), primary_key=True),
        sa.Column("snapshot", postgresql.JSONB(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        schema="famtree",
    )
    op.add_column(
        "notificaciones", sa.Column("resolution_snapshot", postgresql.JSONB()), schema="famtree"
    )
    op.drop_constraint("ck_notificaciones_origen", "notificaciones", schema="famtree")
    op.create_check_constraint("ck_notificaciones_origen", "notificaciones", NEW, schema="famtree")
    op.execute("""DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'famtree_app')
    THEN GRANT SELECT, INSERT ON famtree.moderation_decisions TO famtree_app;
    END IF; END $$""")


def downgrade() -> None:
    # Refuse data loss: snapshots are the only origin of notices after review deletion.
    op.execute("""DO $$ BEGIN IF EXISTS (SELECT 1 FROM famtree.notificaciones
    WHERE resolution_snapshot IS NOT NULL AND codigo_resena IS NULL) THEN
    RAISE EXCEPTION 'Export and remove snapshot notifications before downgrade';
    END IF; END $$""")
    op.drop_constraint("ck_notificaciones_origen", "notificaciones", schema="famtree")
    op.create_check_constraint("ck_notificaciones_origen", "notificaciones", OLD, schema="famtree")
    op.drop_column("notificaciones", "resolution_snapshot", schema="famtree")
    op.drop_table("moderation_decisions", schema="famtree")
