"""Create the approved FamTree relational baseline.

Revision ID: 20260904_0001
Revises:
Create Date: 2026-09-04
"""

from pathlib import Path

from sqlalchemy.engine import Connection

from alembic import context, op

revision = "20260904_0001"
down_revision = None
branch_labels = None
depends_on = None

SQL_DIRECTORY = Path(__file__).parents[1] / "sql"
ROLE_SECTION = "-- ROLES Y PERMISOS"


def _migration_sql(filename: str, *, omit_role_section: bool = False) -> str:
    sql = (SQL_DIRECTORY / filename).read_text(encoding="utf-8")
    sql = "\n".join(line for line in sql.splitlines() if not line.startswith("\\set "))
    if omit_role_section:
        sql = sql[: sql.index(ROLE_SECTION)]
    sql = sql.replace("\nBEGIN;\n", "\n", 1)
    if sql.rstrip().endswith("COMMIT;"):
        sql = sql.rstrip()[: -len("COMMIT;")]
    return sql.strip() + "\n"


def _upgrade_sql() -> str:
    schema = _migration_sql("0001_famtree_baseline.sql", omit_role_section=True)
    catalogs = _migration_sql("0001_catalogos.sql")
    # The baseline uses ``famtree, public`` while creating domain objects.
    # Restore Alembic's bookkeeping schema before it records this revision.
    return f"{schema}\n{catalogs}\nSET search_path TO public;\n"


def _split_sql_statements(sql: str) -> list[str]:
    """Split PostgreSQL SQL without breaking quoted strings or function bodies."""
    statements: list[str] = []
    start = 0
    index = 0
    quote: str | None = None
    block_comment_depth = 0

    while index < len(sql):
        if quote is not None:
            if sql.startswith(quote, index):
                if quote in {"'", '"'} and sql.startswith(quote * 2, index):
                    index += 2
                    continue
                index += len(quote)
                quote = None
                continue
            index += 1
            continue

        if block_comment_depth:
            if sql.startswith("/*", index):
                block_comment_depth += 1
                index += 2
            elif sql.startswith("*/", index):
                block_comment_depth -= 1
                index += 2
            else:
                index += 1
            continue

        if sql.startswith("--", index):
            newline = sql.find("\n", index)
            index = len(sql) if newline == -1 else newline + 1
            continue
        if sql.startswith("/*", index):
            block_comment_depth = 1
            index += 2
            continue
        if sql[index] in {"'", '"'}:
            quote = sql[index]
            index += 1
            continue
        if sql[index] == "$":
            tag_end = sql.find("$", index + 1)
            if tag_end != -1:
                tag = sql[index + 1 : tag_end]
                if all(character.isalnum() or character == "_" for character in tag):
                    quote = sql[index : tag_end + 1]
                    index = tag_end + 1
                    continue
        if sql[index] == ";":
            statement = sql[start : index + 1].strip()
            if statement:
                statements.append(statement)
            start = index + 1
        index += 1

    remainder = sql[start:].strip()
    if remainder:
        statements.append(remainder)
    return statements


def _execute(sql: str) -> None:
    migration_context = context.get_context()
    if migration_context.as_sql:
        migration_context.impl.static_output(sql)
        return

    bind: Connection = op.get_bind()
    for statement in _split_sql_statements(sql):
        bind.exec_driver_sql(statement)


def upgrade() -> None:
    _execute(_upgrade_sql())


def downgrade() -> None:
    _execute("DROP SCHEMA IF EXISTS famtree CASCADE;\n")
