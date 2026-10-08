"""Allow centers to be registered before their gallery is uploaded.

The gallery still limits each center to fifteen images and automatically keeps
one cover whenever at least one image exists. Uploading images later remains
available to center administrators.
"""

from alembic import op

revision = "20261004_0010"
down_revision = "20261004_0009"
branch_labels = None
depends_on = None


_FUNCTION_WITHOUT_IMAGE_REQUIREMENT = """
CREATE OR REPLACE FUNCTION famtree.fn_asilo_catalogos_minimos()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_asilo BIGINT := COALESCE(NEW.codigo_asilo, OLD.codigo_asilo);
BEGIN
    IF NOT EXISTS (SELECT 1 FROM famtree.asilos WHERE codigo_asilo = v_asilo) THEN
        RETURN NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM famtree.asilos_tipos_adulto WHERE codigo_asilo = v_asilo) THEN
        RAISE EXCEPTION 'RN10: el asilo % debe declarar al menos un tipo de adulto mayor', v_asilo
            USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM famtree.asilos_servicios WHERE codigo_asilo = v_asilo) THEN
        RAISE EXCEPTION 'RN10: el asilo % debe declarar al menos un servicio', v_asilo
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NULL;
END;
$$;
"""

_ORIGINAL_FUNCTION = """
CREATE OR REPLACE FUNCTION famtree.fn_asilo_catalogos_minimos()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_asilo BIGINT := COALESCE(NEW.codigo_asilo, OLD.codigo_asilo);
BEGIN
    IF NOT EXISTS (SELECT 1 FROM famtree.asilos WHERE codigo_asilo = v_asilo) THEN
        RETURN NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM famtree.asilos_tipos_adulto WHERE codigo_asilo = v_asilo) THEN
        RAISE EXCEPTION 'RN10: el asilo % debe declarar al menos un tipo de adulto mayor', v_asilo
            USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM famtree.asilos_servicios WHERE codigo_asilo = v_asilo) THEN
        RAISE EXCEPTION 'RN10: el asilo % debe declarar al menos un servicio', v_asilo
            USING ERRCODE = 'check_violation';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM famtree.imagenes_asilo WHERE codigo_asilo = v_asilo) THEN
        RAISE EXCEPTION 'RN06: el asilo % debe tener al menos una imagen', v_asilo
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NULL;
END;
$$;
"""


def upgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS tg_asilos_imagenes_minimas ON famtree.imagenes_asilo")
    op.execute(_FUNCTION_WITHOUT_IMAGE_REQUIREMENT)
    op.execute(
        "COMMENT ON TABLE famtree.imagenes_asilo IS "
        "'Galeria opcional del centro. Hasta 15 imagenes y exactamente una portada "
        "cuando hay imagenes (RN07)'"
    )


def downgrade() -> None:
    op.execute(_ORIGINAL_FUNCTION)
    op.execute(
        """CREATE CONSTRAINT TRIGGER tg_asilos_imagenes_minimas
        AFTER DELETE ON famtree.imagenes_asilo
        DEFERRABLE INITIALLY DEFERRED
        FOR EACH ROW EXECUTE FUNCTION famtree.fn_asilo_catalogos_minimos()"""
    )
