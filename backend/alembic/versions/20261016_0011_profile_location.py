"""Persist optional profile municipality and province selections."""

import sqlalchemy as sa

from alembic import op

revision = "20261016_0011"
down_revision = "20261004_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    for field, table, key in [
        ("codigo_provincia", "provincias", "codigo_provincia"),
        ("codigo_municipio", "municipios", "codigo_municipio"),
    ]:
        op.add_column(
            "usuarios", sa.Column(field, sa.BigInteger(), nullable=True), schema="famtree"
        )
        op.create_foreign_key(
            f"fk_usuarios_{field}",
            "usuarios",
            table,
            [field],
            [key],
            source_schema="famtree",
            referent_schema="famtree",
        )


def downgrade() -> None:
    for field in ["codigo_municipio", "codigo_provincia"]:
        op.drop_constraint(f"fk_usuarios_{field}", "usuarios", schema="famtree", type_="foreignkey")
        op.drop_column("usuarios", field, schema="famtree")
