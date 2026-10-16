"""Notify opted-in registered users when a center is created.

The existing availability preference governs newly available centers as well as
favorite status changes. Keep the database preference guard as defense in depth.
"""

from alembic import op

revision = "20261016_0013"
down_revision = "20261016_0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE famtree.tipo_evento_notificacion ADD VALUE IF NOT EXISTS 'NUEVO_CENTRO'")
    op.execute("""
CREATE OR REPLACE FUNCTION famtree.fn_notificacion_respeta_preferencias()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_permitida BOOLEAN;
    v_rol       famtree.rol_usuario;
BEGIN
    SELECT rol INTO v_rol
      FROM famtree.usuarios
     WHERE codigo_usuario = NEW.codigo_usuario;
    IF v_rol <> 'USUARIO_REGISTRADO' THEN
        RAISE EXCEPTION 'RN16: solo un USUARIO_REGISTRADO recibe notificaciones (usuario % es %)',
            NEW.codigo_usuario, v_rol USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT CASE NEW.tipo_evento::text
             WHEN 'NUEVO_CENTRO'           THEN p.alerta_disponibilidad
             WHEN 'ESTADO_FAVORITO'        THEN p.alerta_disponibilidad
             WHEN 'ACTUALIZACION_FAVORITO' THEN p.alerta_actualizacion
             WHEN 'RESOLUCION_REPORTE'     THEN p.alerta_moderacion
           END
      INTO v_permitida
      FROM famtree.preferencias_notificacion p
     WHERE p.codigo_usuario = NEW.codigo_usuario;

    IF COALESCE(v_permitida, TRUE) = FALSE THEN
        RETURN NULL;   -- el usuario apago esta categoria: no se inserta
    END IF;
    RETURN NEW;
END;
$$;
""")


def downgrade() -> None:
    op.execute("DELETE FROM famtree.notificaciones WHERE tipo_evento::text = 'NUEVO_CENTRO'")
    # PostgreSQL cannot DROP an enum value. Retain the unused value on downgrade;
    # the older application never emits it, and a subsequent upgrade is idempotent.
    op.execute("""
CREATE OR REPLACE FUNCTION famtree.fn_notificacion_respeta_preferencias()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_permitida BOOLEAN;
    v_rol       famtree.rol_usuario;
BEGIN
    SELECT rol INTO v_rol
      FROM famtree.usuarios
     WHERE codigo_usuario = NEW.codigo_usuario;
    IF v_rol <> 'USUARIO_REGISTRADO' THEN
        RAISE EXCEPTION 'RN16: solo un USUARIO_REGISTRADO recibe notificaciones (usuario % es %)',
            NEW.codigo_usuario, v_rol USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT CASE NEW.tipo_evento
             WHEN 'ESTADO_FAVORITO'        THEN p.alerta_disponibilidad
             WHEN 'ACTUALIZACION_FAVORITO' THEN p.alerta_actualizacion
             WHEN 'RESOLUCION_REPORTE'     THEN p.alerta_moderacion
           END
      INTO v_permitida
      FROM famtree.preferencias_notificacion p
     WHERE p.codigo_usuario = NEW.codigo_usuario;

    IF COALESCE(v_permitida, TRUE) = FALSE THEN
        RETURN NULL;   -- el usuario apago esta categoria: no se inserta
    END IF;
    RETURN NEW;
END;
$$;
""")
