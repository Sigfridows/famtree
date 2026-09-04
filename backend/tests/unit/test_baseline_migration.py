import importlib.util
from collections.abc import Callable
from pathlib import Path
from types import ModuleType
from typing import cast


def _load_baseline_module() -> ModuleType:
    migration_path = (
        Path(__file__).parents[2] / "alembic" / "versions" / "20260904_0001_famtree_baseline.py"
    )
    spec = importlib.util.spec_from_file_location("famtree_baseline_migration", migration_path)
    assert spec is not None
    assert spec.loader is not None

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_sql_splitter_preserves_postgresql_quoted_bodies() -> None:
    module = _load_baseline_module()
    split_sql = cast(Callable[[str], list[str]], module._split_sql_statements)
    sql = """
    -- A comment containing a semicolon;
    SELECT 'a;''b';
    DO $migration$
    BEGIN
        RAISE NOTICE 'still; one statement';
    END
    $migration$;
    /* A nested /* block; comment */ remains safe. */
    SELECT "quoted;identifier";
    """

    statements = split_sql(sql)

    assert len(statements) == 3
    assert "SELECT 'a;''b';" in statements[0]
    assert "RAISE NOTICE 'still; one statement';" in statements[1]
    assert 'SELECT "quoted;identifier";' in statements[2]


def test_upgrade_sql_removes_psql_transaction_and_privileged_role_commands() -> None:
    module = _load_baseline_module()
    upgrade_sql = cast(Callable[[], str], module._upgrade_sql)()

    assert "\\set ON_ERROR_STOP" not in upgrade_sql
    assert "CREATE ROLE famtree_app" not in upgrade_sql
    assert "-- ROLES Y PERMISOS" not in upgrade_sql
    assert upgrade_sql.endswith("SET search_path TO public;\n")
