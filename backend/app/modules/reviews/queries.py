"""Public SQL read contract for other modules; owns the shared ratings view."""

from sqlalchemy import BigInteger, Numeric, column, table
from sqlalchemy.sql.selectable import TableClause


def public_ratings() -> TableClause:
    """Published counts are retained; averages are NULL below three published reviews."""
    return table(
        "vw_asilos_calificacion",
        column("codigo_asilo", BigInteger),
        column("total_resenas", BigInteger),
        column("calificacion_promedio", Numeric),
        schema="famtree",
    )
