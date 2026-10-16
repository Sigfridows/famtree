"""Publish center averages only after three published reviews.

Counts, distribution inputs and review rows remain unchanged. Replacing the
shared view also updates its dependent public catalog view without dropping it.
"""

from alembic import op

revision = "20261016_0012"
down_revision = "20261016_0011"
branch_labels = None
depends_on = None


def _replace_view(average: str) -> None:
    op.execute(
        f"""
        CREATE OR REPLACE VIEW famtree.vw_asilos_calificacion AS
        SELECT a.codigo_asilo,
               count(r.codigo_resena) AS total_resenas,
               {average} AS calificacion_promedio,
               count(*) FILTER (WHERE r.calificacion = 5) AS cinco_estrellas,
               max(r.fecha_publicacion) AS ultima_resena
          FROM famtree.asilos a
          LEFT JOIN famtree.resenas r
                 ON r.codigo_asilo = a.codigo_asilo
                AND r.estado_resena = 'PUBLICADA'
         GROUP BY a.codigo_asilo
        """
    )


def upgrade() -> None:
    _replace_view(
        "CASE WHEN count(r.codigo_resena) >= 3 "
        "THEN round(avg(r.calificacion)::numeric, 2) ELSE NULL END"
    )


def downgrade() -> None:
    _replace_view("round(avg(r.calificacion)::numeric, 2)")
