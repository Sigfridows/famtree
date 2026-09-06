-- =============================================================================
-- FamTree - Esquema PostgreSQL
-- =============================================================================
-- Motor      : PostgreSQL 14 o superior (probado en 16.13)
-- Esquema    : famtree
-- Fuentes    : diagramas ER, clases y objetos actualizados + HUs de FamTree
--
-- Convencion de nombres
--   tablas     plural, minuscula, snake_case, sin acentos ni enie
--   PK         codigo_<entidad>   (BIGINT IDENTITY)
--   FK         codigo_<entidad referenciada>, con sufijo de rol cuando hay varias
--   indices    ix_<tabla>_<columna>      unicos: uq_<tabla>_<columna>
--   llaves     pk_/fk_/ck_<tabla>_<detalle>
--
-- Orden de creacion: extensiones -> tipos -> tablas (padres antes que hijos)
--                    -> indices -> funciones -> triggers -> vistas -> permisos
--
-- Para recrear desde cero (DESTRUCTIVO, borra todos los datos):
--   DROP SCHEMA IF EXISTS famtree CASCADE;
-- =============================================================================

\set ON_ERROR_STOP on

BEGIN;

-- ---------------------------------------------------------------- extensiones
CREATE EXTENSION IF NOT EXISTS citext;    -- texto case-insensitive (email, username)
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- busqueda por similitud en nombres
CREATE EXTENSION IF NOT EXISTS unaccent;  -- busqueda ignorando acentos

CREATE SCHEMA IF NOT EXISTS famtree;
SET search_path = famtree, public;

-- unaccent() es STABLE porque depende del diccionario; para poder usarla dentro
-- de un indice hace falta una envoltura IMMUTABLE.
CREATE OR REPLACE FUNCTION famtree.f_unaccent(text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
SET search_path = pg_catalog, public AS
$$ SELECT public.unaccent('public.unaccent', $1) $$;

-- --------------------------------------------------------------------- tipos
CREATE TYPE famtree.estado_asilo AS ENUM ('ACTIVO', 'INACTIVO');

CREATE TYPE famtree.rol_usuario AS ENUM ('USUARIO_REGISTRADO', 'ADMIN_ASILO', 'ADMIN_SISTEMA');

CREATE TYPE famtree.estado_usuario AS ENUM ('ACTIVO', 'BLOQUEADO');

CREATE TYPE famtree.estado_resena AS ENUM ('PUBLICADA', 'OCULTA');

CREATE TYPE famtree.motivo_reporte AS ENUM (
    'LENGUAJE_OFENSIVO',
    'INFO_FALSA',
    'SPAM',
    'CONFLICTO_INTERES',
    'OTRO'
);

CREATE TYPE famtree.estado_reporte AS ENUM ('PENDIENTE', 'DESCARTADO', 'RESENA_ELIMINADA');

CREATE TYPE famtree.tipo_evento_notificacion AS ENUM (
    'ESTADO_FAVORITO',        -- el asilo favorito cambio de disponibilidad
    'ACTUALIZACION_FAVORITO', -- el asilo favorito actualizo su informacion
    'RESOLUCION_REPORTE'      -- se resolvio un reporte de resena
);


-- =============================================================================
-- MODULO 1 - GEOGRAFIA
-- =============================================================================
-- El diccionario guardaba provincia y municipio como VARCHAR dentro de asilos.
-- Eso es una dependencia transitiva (3FN) y ademas hace imposible filtrar sin
-- errores de tipeo. Se extraen a dos catalogos.

CREATE TABLE famtree.provincias (
    codigo_provincia   BIGINT       GENERATED ALWAYS AS IDENTITY,
    nombre_provincia   VARCHAR(60)  NOT NULL,

    CONSTRAINT pk_provincias         PRIMARY KEY (codigo_provincia),
    CONSTRAINT uq_provincias_nombre  UNIQUE (nombre_provincia),
    CONSTRAINT ck_provincias_nombre  CHECK (length(btrim(nombre_provincia)) >= 3)
);

CREATE TABLE famtree.municipios (
    codigo_municipio   BIGINT       GENERATED ALWAYS AS IDENTITY,
    codigo_provincia   BIGINT       NOT NULL,
    nombre_municipio   VARCHAR(60)  NOT NULL,

    CONSTRAINT pk_municipios          PRIMARY KEY (codigo_municipio),
    CONSTRAINT fk_municipios_provincia FOREIGN KEY (codigo_provincia)
        REFERENCES famtree.provincias (codigo_provincia)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_municipios_nombre   UNIQUE (codigo_provincia, nombre_municipio),
    CONSTRAINT ck_municipios_nombre   CHECK (length(btrim(nombre_municipio)) >= 3)
);


-- =============================================================================
-- MODULO 2 - CATALOGOS
-- =============================================================================

CREATE TABLE famtree.tipos_adulto_mayor (
    codigo_tipo   BIGINT        GENERATED ALWAYS AS IDENTITY,
    nombre_tipo   VARCHAR(100)  NOT NULL,
    estado_tipo   BOOLEAN       NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_tipos_adulto_mayor        PRIMARY KEY (codigo_tipo),
    CONSTRAINT uq_tipos_adulto_mayor_nombre UNIQUE (nombre_tipo)
);

CREATE TABLE famtree.servicios (
    codigo_servicio   BIGINT        GENERATED ALWAYS AS IDENTITY,
    nombre_servicio   VARCHAR(100)  NOT NULL,
    estado_servicio   BOOLEAN       NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_servicios        PRIMARY KEY (codigo_servicio),
    CONSTRAINT uq_servicios_nombre UNIQUE (nombre_servicio)
);


-- =============================================================================
-- MODULO 3 - CENTROS DE ATENCION
-- =============================================================================

CREATE TABLE famtree.asilos (
    codigo_asilo         BIGINT          GENERATED ALWAYS AS IDENTITY,
    codigo_municipio     BIGINT          NOT NULL,
    nombre_asilo         VARCHAR(100)    NOT NULL,
    descripcion_asilo    TEXT            NOT NULL,
    sector_asilo         VARCHAR(100)    NOT NULL,
    direccion_asilo      VARCHAR(200)    NOT NULL,
    latitud              NUMERIC(9,6)    NOT NULL,
    longitud             NUMERIC(9,6)    NOT NULL,
    capacidad_total      INTEGER         NOT NULL,
    precio_minimo        NUMERIC(10,2)   NOT NULL,
    precio_maximo        NUMERIC(10,2)   NOT NULL,
    requisitos_ingreso   VARCHAR(500)    NOT NULL,
    certificaciones      VARCHAR(250),
    telefono_asilo       VARCHAR(10)     NOT NULL,
    email_asilo          CITEXT          NOT NULL,
    sitio_web            VARCHAR(255),
    estado_asilo         famtree.estado_asilo NOT NULL DEFAULT 'ACTIVO',
    fecha_creacion       TIMESTAMPTZ     NOT NULL DEFAULT now(),
    fecha_actualizacion  TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT pk_asilos            PRIMARY KEY (codigo_asilo),
    CONSTRAINT fk_asilos_municipio  FOREIGN KEY (codigo_municipio)
        REFERENCES famtree.municipios (codigo_municipio)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_asilos_nombre       CHECK (length(btrim(nombre_asilo)) BETWEEN 5 AND 100),
    CONSTRAINT ck_asilos_descripcion  CHECK (length(btrim(descripcion_asilo)) BETWEEN 20 AND 1000),
    CONSTRAINT ck_asilos_requisitos   CHECK (length(btrim(requisitos_ingreso)) BETWEEN 10 AND 500),
    CONSTRAINT ck_asilos_capacidad    CHECK (capacidad_total > 0),
    CONSTRAINT ck_asilos_precio_min   CHECK (precio_minimo > 0),
    CONSTRAINT ck_asilos_precio_rango CHECK (precio_maximo >= precio_minimo),
    -- Republica Dominicana cabe holgadamente en este recuadro; evita coordenadas
    -- invertidas (lat/lon al reves) que es el error mas comun al cargar el mapa.
    CONSTRAINT ck_asilos_latitud      CHECK (latitud  BETWEEN  17.0 AND  20.5),
    CONSTRAINT ck_asilos_longitud     CHECK (longitud BETWEEN -72.5 AND -68.0),
    CONSTRAINT ck_asilos_telefono     CHECK (telefono_asilo ~ '^[0-9]{10}$'),
    CONSTRAINT ck_asilos_email        CHECK (email_asilo ~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$'),
    CONSTRAINT ck_asilos_sitio_web    CHECK (sitio_web IS NULL OR sitio_web ~* '^https?://'),
    CONSTRAINT ck_asilos_fechas       CHECK (fecha_actualizacion >= fecha_creacion)
);

CREATE TABLE famtree.imagenes_asilo (
    codigo_imagen    BIGINT        GENERATED ALWAYS AS IDENTITY,
    codigo_asilo     BIGINT        NOT NULL,
    url              VARCHAR(255)  NOT NULL,
    es_portada       BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_creacion   TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_imagenes_asilo       PRIMARY KEY (codigo_imagen),
    CONSTRAINT fk_imagenes_asilo_asilo FOREIGN KEY (codigo_asilo)
        REFERENCES famtree.asilos (codigo_asilo)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_imagenes_asilo_url   UNIQUE (codigo_asilo, url),
    CONSTRAINT ck_imagenes_asilo_url   CHECK (length(btrim(url)) > 0)
);

-- Resuelve el muchos a muchos asilos <-> tipos_adulto_mayor
CREATE TABLE famtree.asilos_tipos_adulto (
    codigo_tipo_asilo   BIGINT  GENERATED ALWAYS AS IDENTITY,
    codigo_asilo        BIGINT  NOT NULL,
    codigo_tipo         BIGINT  NOT NULL,

    CONSTRAINT pk_asilos_tipos_adulto       PRIMARY KEY (codigo_tipo_asilo),
    CONSTRAINT fk_asilos_tipos_adulto_asilo FOREIGN KEY (codigo_asilo)
        REFERENCES famtree.asilos (codigo_asilo)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_asilos_tipos_adulto_tipo  FOREIGN KEY (codigo_tipo)
        REFERENCES famtree.tipos_adulto_mayor (codigo_tipo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_asilos_tipos_adulto       UNIQUE (codigo_asilo, codigo_tipo)
);

-- Resuelve el muchos a muchos asilos <-> servicios
CREATE TABLE famtree.asilos_servicios (
    codigo_servicio_asilo   BIGINT  GENERATED ALWAYS AS IDENTITY,
    codigo_asilo            BIGINT  NOT NULL,
    codigo_servicio         BIGINT  NOT NULL,

    CONSTRAINT pk_asilos_servicios          PRIMARY KEY (codigo_servicio_asilo),
    CONSTRAINT fk_asilos_servicios_asilo    FOREIGN KEY (codigo_asilo)
        REFERENCES famtree.asilos (codigo_asilo)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_asilos_servicios_servicio FOREIGN KEY (codigo_servicio)
        REFERENCES famtree.servicios (codigo_servicio)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_asilos_servicios          UNIQUE (codigo_asilo, codigo_servicio)
);


-- =============================================================================
-- MODULO 4 - CUENTAS Y ACCESO
-- =============================================================================

CREATE TABLE famtree.usuarios (
    codigo_usuario          BIGINT        GENERATED ALWAYS AS IDENTITY,
    codigo_asilo_asignado   BIGINT,
    nombre_usuario          VARCHAR(50)   NOT NULL,
    apellido_usuario        VARCHAR(50)   NOT NULL,
    username                CITEXT        NOT NULL,
    email                   CITEXT        NOT NULL,
    telefono                VARCHAR(10),
    password_hash           VARCHAR(255)  NOT NULL,
    foto_perfil             VARCHAR(255),
    descripcion             TEXT,
    rol                     famtree.rol_usuario    NOT NULL DEFAULT 'USUARIO_REGISTRADO',
    estado                  famtree.estado_usuario NOT NULL DEFAULT 'ACTIVO',
    requiere_cambio_clave   BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_registro          TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_usuarios       PRIMARY KEY (codigo_usuario),
    -- RESTRICT y no SET NULL: ck_usuarios_asignacion exige que todo ADMIN_ASILO
    -- tenga centro, asi que anular la columna dejaria la fila invalida. Borrar un
    -- centro con administrador activo debe ser una decision explicita: primero se
    -- reasigna o se cambia el rol de esa cuenta. La baja normal de un asilo es
    -- logica (estado_asilo = 'INACTIVO', RN05), no un DELETE.
    CONSTRAINT fk_usuarios_asilo FOREIGN KEY (codigo_asilo_asignado)
        REFERENCES famtree.asilos (codigo_asilo)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_usuarios_username UNIQUE (username),
    CONSTRAINT uq_usuarios_email    UNIQUE (email),

    -- El diagrama de objetos usa "carla.reyes": el punto se permite solo como
    -- separador interno, nunca al inicio, al final ni repetido.
    CONSTRAINT ck_usuarios_username CHECK (
        length(username::text) BETWEEN 3 AND 16
        AND username::text ~ '^[A-Za-z0-9]+([.][A-Za-z0-9]+)*$'
    ),
    CONSTRAINT ck_usuarios_email    CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$'),
    CONSTRAINT ck_usuarios_telefono CHECK (telefono IS NULL OR telefono ~ '^[0-9]{10}$'),
    CONSTRAINT ck_usuarios_nombre   CHECK (length(btrim(nombre_usuario))   >= 2),
    CONSTRAINT ck_usuarios_apellido CHECK (length(btrim(apellido_usuario)) >= 2),
    -- El hash nunca puede quedar vacio ni parecerse a una contrasena en claro.
    CONSTRAINT ck_usuarios_password CHECK (length(password_hash) >= 20),

    -- RN02: solo el administrador de asilo tiene centro asignado, y lo tiene siempre.
    CONSTRAINT ck_usuarios_asignacion CHECK (
        (rol =  'ADMIN_ASILO' AND codigo_asilo_asignado IS NOT NULL) OR
        (rol <> 'ADMIN_ASILO' AND codigo_asilo_asignado IS NULL)
    ),
    -- RN02b: el telefono es obligatorio para el administrador de asilo.
    CONSTRAINT ck_usuarios_telefono_admin CHECK (
        rol <> 'ADMIN_ASILO' OR telefono IS NOT NULL
    ),
    -- Herencia de tabla unica: estos atributos solo existen en el subtipo que
    -- los declara en el diagrama de clases.
    CONSTRAINT ck_usuarios_perfil_por_rol CHECK (
        rol = 'USUARIO_REGISTRADO' OR (foto_perfil IS NULL AND descripcion IS NULL)
    ),
    CONSTRAINT ck_usuarios_cambio_clave_por_rol CHECK (
        rol = 'ADMIN_ASILO' OR requiere_cambio_clave = FALSE
    )
);

-- Relacion 1:1 con usuarios. La fila se crea sola por trigger al registrar.
CREATE TABLE famtree.preferencias_notificacion (
    codigo_preferencia      BIGINT   GENERATED ALWAYS AS IDENTITY,
    codigo_usuario          BIGINT   NOT NULL,
    alerta_disponibilidad   BOOLEAN  NOT NULL DEFAULT TRUE,
    alerta_actualizacion    BOOLEAN  NOT NULL DEFAULT TRUE,
    alerta_moderacion       BOOLEAN  NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_preferencias_notificacion    PRIMARY KEY (codigo_preferencia),
    CONSTRAINT fk_preferencias_usuario FOREIGN KEY (codigo_usuario)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    -- Esta UNIQUE es lo unico que convierte la relacion en 1:1 y no en 1:N.
    CONSTRAINT uq_preferencias_usuario UNIQUE (codigo_usuario)
);

-- Historial de bloqueos. HU34/HU35 exigen guardar quien, cuando y por que;
-- una columna motivo_bloqueo dentro de usuarios no alcanza para auditar.
CREATE TABLE famtree.bloqueos_usuario (
    codigo_bloqueo             BIGINT        GENERATED ALWAYS AS IDENTITY,
    codigo_usuario             BIGINT        NOT NULL,
    codigo_admin_bloqueo       BIGINT        NOT NULL,
    codigo_admin_desbloqueo    BIGINT,
    motivo                     VARCHAR(300)  NOT NULL,
    fecha_bloqueo              TIMESTAMPTZ   NOT NULL DEFAULT now(),
    fecha_desbloqueo           TIMESTAMPTZ,

    CONSTRAINT pk_bloqueos_usuario PRIMARY KEY (codigo_bloqueo),
    -- RESTRICT, no CASCADE: esta tabla existe para auditar (HU34, HU35). Con
    -- CASCADE, borrar la cuenta bloqueada borraba en silencio el registro de
    -- quien la bloqueo y por que. Las tres FK de esta tabla son RESTRICT.
    CONSTRAINT fk_bloqueos_usuario FOREIGN KEY (codigo_usuario)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bloqueos_admin_bloqueo FOREIGN KEY (codigo_admin_bloqueo)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bloqueos_admin_desbloqueo FOREIGN KEY (codigo_admin_desbloqueo)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_bloqueos_motivo CHECK (length(btrim(motivo)) BETWEEN 10 AND 300),
    -- RN12: nadie se bloquea a si mismo.
    CONSTRAINT ck_bloqueos_no_autobloqueo CHECK (codigo_usuario <> codigo_admin_bloqueo),
    -- RN13: el desbloqueo es atomico - o hay fecha y administrador, o no hay ninguno.
    CONSTRAINT ck_bloqueos_desbloqueo CHECK (
        (fecha_desbloqueo IS NULL     AND codigo_admin_desbloqueo IS NULL) OR
        (fecha_desbloqueo IS NOT NULL AND codigo_admin_desbloqueo IS NOT NULL
                                      AND fecha_desbloqueo >= fecha_bloqueo)
    )
);

-- Un usuario no puede tener dos bloqueos vigentes a la vez.
CREATE UNIQUE INDEX uq_bloqueos_vigente
    ON famtree.bloqueos_usuario (codigo_usuario)
    WHERE fecha_desbloqueo IS NULL;


-- =============================================================================
-- MODULO 5 - INTERACCION DEL USUARIO
-- =============================================================================

CREATE TABLE famtree.resenas (
    codigo_resena         BIGINT        GENERATED ALWAYS AS IDENTITY,
    codigo_usuario        BIGINT        NOT NULL,
    codigo_asilo          BIGINT        NOT NULL,
    calificacion          SMALLINT      NOT NULL,
    comentario            VARCHAR(500)  NOT NULL,
    estado_resena         famtree.estado_resena NOT NULL DEFAULT 'PUBLICADA',
    fecha_publicacion     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    fecha_actualizacion   TIMESTAMPTZ,

    CONSTRAINT pk_resenas         PRIMARY KEY (codigo_resena),
    CONSTRAINT fk_resenas_usuario FOREIGN KEY (codigo_usuario)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_resenas_asilo   FOREIGN KEY (codigo_asilo)
        REFERENCES famtree.asilos (codigo_asilo)
        ON UPDATE CASCADE ON DELETE CASCADE,

    -- RN08: como maximo una resena por usuario y asilo.
    CONSTRAINT uq_resenas_usuario_asilo UNIQUE (codigo_usuario, codigo_asilo),
    CONSTRAINT ck_resenas_calificacion  CHECK (calificacion BETWEEN 1 AND 5),
    CONSTRAINT ck_resenas_comentario    CHECK (length(btrim(comentario)) BETWEEN 10 AND 500),
    CONSTRAINT ck_resenas_fechas        CHECK (
        fecha_actualizacion IS NULL OR fecha_actualizacion >= fecha_publicacion
    )
);

CREATE TABLE famtree.reportes_resena (
    codigo_reporte        BIGINT        GENERATED ALWAYS AS IDENTITY,
    codigo_resena         BIGINT        NOT NULL,
    codigo_denunciante    BIGINT        NOT NULL,
    codigo_moderador      BIGINT,
    motivo                famtree.motivo_reporte NOT NULL,
    detalle               VARCHAR(250),
    justificacion         VARCHAR(300),
    estado_reporte        famtree.estado_reporte NOT NULL DEFAULT 'PENDIENTE',
    fecha_reporte         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    fecha_resolucion      TIMESTAMPTZ,

    CONSTRAINT pk_reportes_resena PRIMARY KEY (codigo_reporte),
    CONSTRAINT fk_reportes_resena FOREIGN KEY (codigo_resena)
        REFERENCES famtree.resenas (codigo_resena)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_reportes_denunciante FOREIGN KEY (codigo_denunciante)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reportes_moderador FOREIGN KEY (codigo_moderador)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Un mismo usuario no reporta dos veces la misma resena.
    CONSTRAINT uq_reportes_denunciante UNIQUE (codigo_resena, codigo_denunciante),
    CONSTRAINT ck_reportes_detalle CHECK (
        detalle IS NULL OR length(btrim(detalle)) BETWEEN 10 AND 250
    ),
    -- RN14: un reporte solo se cierra con moderador, justificacion y fecha.
    CONSTRAINT ck_reportes_resolucion CHECK (
        (estado_reporte =  'PENDIENTE'
            AND codigo_moderador IS NULL
            AND justificacion    IS NULL
            AND fecha_resolucion IS NULL)
        OR
        (estado_reporte <> 'PENDIENTE'
            AND codigo_moderador IS NOT NULL
            AND justificacion    IS NOT NULL
            AND length(btrim(justificacion)) BETWEEN 10 AND 300
            AND fecha_resolucion IS NOT NULL
            AND fecha_resolucion >= fecha_reporte)
    )
);

CREATE TABLE famtree.favoritos (
    codigo_favorito   BIGINT       GENERATED ALWAYS AS IDENTITY,
    codigo_usuario    BIGINT       NOT NULL,
    codigo_asilo      BIGINT       NOT NULL,
    fecha_creacion    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_favoritos         PRIMARY KEY (codigo_favorito),
    CONSTRAINT fk_favoritos_usuario FOREIGN KEY (codigo_usuario)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_favoritos_asilo   FOREIGN KEY (codigo_asilo)
        REFERENCES famtree.asilos (codigo_asilo)
        ON UPDATE CASCADE ON DELETE CASCADE,
    -- RN11: no se guarda dos veces el mismo asilo.
    CONSTRAINT uq_favoritos_usuario_asilo UNIQUE (codigo_usuario, codigo_asilo)
);

-- El diccionario traia entidad_id + tipo_entidad (FK polimorfica, sin integridad
-- referencial posible). Se sustituye por dos FK opcionales y un CHECK que obliga
-- a que cada notificacion apunte exactamente al origen que corresponde a su tipo.
CREATE TABLE famtree.notificaciones (
    codigo_notificacion   BIGINT        GENERATED ALWAYS AS IDENTITY,
    codigo_usuario        BIGINT        NOT NULL,
    codigo_asilo          BIGINT,
    codigo_resena         BIGINT,
    tipo_evento           famtree.tipo_evento_notificacion NOT NULL,
    titulo                VARCHAR(150)  NOT NULL,
    mensaje               TEXT          NOT NULL,
    leida                 BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_creacion        TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT pk_notificaciones         PRIMARY KEY (codigo_notificacion),
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (codigo_usuario)
        REFERENCES famtree.usuarios (codigo_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_notificaciones_asilo   FOREIGN KEY (codigo_asilo)
        REFERENCES famtree.asilos (codigo_asilo)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_notificaciones_resena  FOREIGN KEY (codigo_resena)
        REFERENCES famtree.resenas (codigo_resena)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT ck_notificaciones_titulo CHECK (length(btrim(titulo)) > 0),
    CONSTRAINT ck_notificaciones_origen CHECK (
        (tipo_evento =  'RESOLUCION_REPORTE'
            AND codigo_resena IS NOT NULL AND codigo_asilo  IS NULL)
        OR
        (tipo_evento <> 'RESOLUCION_REPORTE'
            AND codigo_asilo  IS NOT NULL AND codigo_resena IS NULL)
    )
);


-- =============================================================================
-- INDICES
-- =============================================================================
-- PostgreSQL NO indexa las claves foraneas automaticamente. Aqui se indexa toda
-- FK que no quede ya cubierta como primera columna de una UNIQUE, mas los
-- accesos que las historias de usuario ejercitan en cada pantalla.

-- claves foraneas
CREATE INDEX ix_asilos_municipio            ON famtree.asilos (codigo_municipio);
CREATE INDEX ix_asilos_tipos_adulto_tipo    ON famtree.asilos_tipos_adulto (codigo_tipo);
CREATE INDEX ix_asilos_servicios_servicio   ON famtree.asilos_servicios (codigo_servicio);
-- La asociacion Asilo <-> AdministradorAsilo es 0..1 en ambos extremos. El
-- CHECK de rol hace que toda fila no nula sea ADMIN_ASILO; este UNIQUE parcial
-- tambien cubre el indice que PostgreSQL necesita para la FK.
CREATE UNIQUE INDEX uq_usuarios_admin_asilo_asignado
    ON famtree.usuarios (codigo_asilo_asignado)
    WHERE rol = 'ADMIN_ASILO';
CREATE INDEX ix_bloqueos_usuario            ON famtree.bloqueos_usuario (codigo_usuario);
CREATE INDEX ix_bloqueos_admin_bloqueo      ON famtree.bloqueos_usuario (codigo_admin_bloqueo);
CREATE INDEX ix_bloqueos_admin_desbloqueo   ON famtree.bloqueos_usuario (codigo_admin_desbloqueo);
CREATE INDEX ix_resenas_asilo               ON famtree.resenas (codigo_asilo);
CREATE INDEX ix_reportes_denunciante        ON famtree.reportes_resena (codigo_denunciante);
CREATE INDEX ix_reportes_moderador          ON famtree.reportes_resena (codigo_moderador);
CREATE INDEX ix_favoritos_asilo             ON famtree.favoritos (codigo_asilo);
CREATE INDEX ix_notificaciones_asilo        ON famtree.notificaciones (codigo_asilo);
CREATE INDEX ix_notificaciones_resena       ON famtree.notificaciones (codigo_resena);

-- catalogo publico: solo interesan los asilos activos
CREATE INDEX ix_asilos_activos
    ON famtree.asilos (codigo_municipio, nombre_asilo)
    WHERE estado_asilo = 'ACTIVO';

-- busqueda por nombre tolerante a acentos y a errores de tipeo
CREATE INDEX ix_asilos_nombre_trgm
    ON famtree.asilos USING gin (famtree.f_unaccent(nombre_asilo) gin_trgm_ops);

-- mapa: recuadro de coordenadas
CREATE INDEX ix_asilos_coordenadas ON famtree.asilos (latitud, longitud);

-- filtro por rango de precio
CREATE INDEX ix_asilos_precio ON famtree.asilos (precio_minimo, precio_maximo);

-- resenas visibles de un asilo, mas recientes primero
CREATE INDEX ix_resenas_asilo_publicadas
    ON famtree.resenas (codigo_asilo, fecha_publicacion DESC)
    WHERE estado_resena = 'PUBLICADA';

-- bandeja de moderacion
CREATE INDEX ix_reportes_pendientes
    ON famtree.reportes_resena (fecha_reporte)
    WHERE estado_reporte = 'PENDIENTE';

-- campana de notificaciones: no leidas del usuario, mas recientes primero
CREATE INDEX ix_notificaciones_no_leidas
    ON famtree.notificaciones (codigo_usuario, fecha_creacion DESC)
    WHERE leida = FALSE;

-- RN06: exactamente una portada por asilo
CREATE UNIQUE INDEX uq_imagenes_asilo_portada
    ON famtree.imagenes_asilo (codigo_asilo)
    WHERE es_portada;

-- listado de usuarios del panel administrativo
CREATE INDEX ix_usuarios_rol_estado ON famtree.usuarios (rol, estado);

-- Soporta la comprobacion de RN04 (nombre unico por provincia). Sin este indice
-- el trigger recorre la tabla entera en cada alta de centro, y el costo crece
-- con el catalogo. La expresion es exactamente la que usa el trigger.
CREATE INDEX ix_asilos_nombre_normalizado
    ON famtree.asilos (
        lower(famtree.f_unaccent(regexp_replace(btrim(nombre_asilo), '\s+', ' ', 'g')))
    );


-- =============================================================================
-- REGLAS DE NEGOCIO QUE UN CHECK NO PUEDE EXPRESAR
-- =============================================================================
-- Un CHECK solo ve la fila que se esta escribiendo. Las reglas que miran otras
-- filas u otras tablas se implementan como triggers. Todas viven en la base de
-- datos a proposito: la aplicacion puede tener bugs, la base no debe permitir
-- que entren datos invalidos por ninguna via.

-- --------------------------------------------------------------- fechas ----
CREATE OR REPLACE FUNCTION famtree.fn_touch_actualizacion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
BEGIN
    NEW.fecha_actualizacion := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_asilos_touch
    BEFORE UPDATE ON famtree.asilos
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_touch_actualizacion();

-- En resenas la columna queda NULL mientras nunca se edito el contenido, asi que
-- solo se marca cuando cambia la calificacion o el comentario (HU21).
CREATE TRIGGER tg_resenas_touch
    BEFORE UPDATE ON famtree.resenas
    FOR EACH ROW
    WHEN (OLD.calificacion IS DISTINCT FROM NEW.calificacion
       OR OLD.comentario   IS DISTINCT FROM NEW.comentario)
    EXECUTE FUNCTION famtree.fn_touch_actualizacion();


-- ----------------------------------------- RN04: nombre unico por provincia --
-- La provincia se alcanza a traves de municipios, asi que no hay UNIQUE posible
-- sin desnormalizar. Se resuelve con trigger. La comparacion ignora acentos,
-- mayusculas y espacios repetidos: "Hogar San Jose" y "hogar  san jose" chocan.
CREATE OR REPLACE FUNCTION famtree.fn_asilo_nombre_unico_provincia()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_provincia   BIGINT;
    v_choque      BIGINT;
    v_normalizado TEXT;
BEGIN
    SELECT codigo_provincia INTO v_provincia
      FROM famtree.municipios
     WHERE codigo_municipio = NEW.codigo_municipio;

    -- Sin este lock la regla es una carrera: dos transacciones simultaneas leen
    -- ambas "no hay choque" y ambas insertan el mismo nombre. Serializa solo a
    -- los asilos de esa provincia y se libera al terminar la transaccion.
    PERFORM pg_advisory_xact_lock(hashtext('famtree.asilos.nombre_por_provincia'),
                                  hashtext(v_provincia::text));

    -- El nombre normalizado va primero y esta indexado (ix_asilos_nombre_normalizado):
    -- reduce la busqueda a un punado de filas antes de mirar la provincia.
    v_normalizado := lower(famtree.f_unaccent(
        regexp_replace(btrim(NEW.nombre_asilo), '\s+', ' ', 'g')));

    SELECT a.codigo_asilo INTO v_choque
      FROM famtree.asilos a
      JOIN famtree.municipios m ON m.codigo_municipio = a.codigo_municipio
     WHERE lower(famtree.f_unaccent(regexp_replace(btrim(a.nombre_asilo), '\s+', ' ', 'g')))
             = v_normalizado
       AND m.codigo_provincia = v_provincia
       AND a.codigo_asilo <> NEW.codigo_asilo
     LIMIT 1;

    IF v_choque IS NOT NULL THEN
        RAISE EXCEPTION
            'RN04: ya existe un asilo llamado "%" en esa provincia (codigo_asilo=%)',
            NEW.nombre_asilo, v_choque
            USING ERRCODE = 'unique_violation';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_asilos_nombre_unico
    BEFORE INSERT OR UPDATE OF nombre_asilo, codigo_municipio ON famtree.asilos
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_asilo_nombre_unico_provincia();

-- RN04 tiene una segunda puerta de entrada: la provincia de un asilo se alcanza
-- a traves de municipios, asi que reasignar un municipio a otra provincia puede
-- juntar dos asilos homonimos sin tocar la tabla asilos. Vigilar solo asilos
-- deja ese camino abierto.
CREATE OR REPLACE FUNCTION famtree.fn_municipio_revalida_nombres()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_choque BIGINT;
    v_nombre TEXT;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('famtree.asilos.nombre_por_provincia'),
                                  hashtext(NEW.codigo_provincia::text));

    SELECT a.nombre_asilo, otro.codigo_asilo
      INTO v_nombre, v_choque
      FROM famtree.asilos a
      JOIN famtree.asilos otro
        ON otro.codigo_asilo <> a.codigo_asilo
       AND lower(famtree.f_unaccent(regexp_replace(btrim(otro.nombre_asilo), '\s+', ' ', 'g')))
         = lower(famtree.f_unaccent(regexp_replace(btrim(a.nombre_asilo),    '\s+', ' ', 'g')))
      JOIN famtree.municipios m ON m.codigo_municipio = otro.codigo_municipio
     WHERE a.codigo_municipio = NEW.codigo_municipio
       AND m.codigo_provincia = NEW.codigo_provincia
     LIMIT 1;

    IF v_choque IS NOT NULL THEN
        RAISE EXCEPTION
            'RN04: mover % a esa provincia dejaria dos asilos llamados "%" (codigo_asilo=%)',
            NEW.nombre_municipio, v_nombre, v_choque
            USING ERRCODE = 'unique_violation';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_municipios_revalida_nombres
    BEFORE UPDATE OF codigo_provincia ON famtree.municipios
    FOR EACH ROW WHEN (NEW.codigo_provincia IS DISTINCT FROM OLD.codigo_provincia)
    EXECUTE FUNCTION famtree.fn_municipio_revalida_nombres();


-- --------------------------------- RN06 y RN07: portada y tope de imagenes --
CREATE OR REPLACE FUNCTION famtree.fn_imagenes_asilo_insertar()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    k_max_imagenes CONSTANT INTEGER := 15;   -- HU42
    v_total        INTEGER;
    v_hay_portada  BOOLEAN;
BEGIN
    -- El conteo y la decision de portada se toman de una lectura; sin lock, dos
    -- inserciones simultaneas ven ambas 14 imagenes y el asilo termina con 16.
    PERFORM pg_advisory_xact_lock(hashtext('famtree.imagenes_asilo.por_asilo'),
                                  hashtext(NEW.codigo_asilo::text));

    SELECT count(*), bool_or(es_portada)
      INTO v_total, v_hay_portada
      FROM famtree.imagenes_asilo
     WHERE codigo_asilo = NEW.codigo_asilo;

    IF v_total >= k_max_imagenes THEN
        RAISE EXCEPTION 'RN07: el asilo % ya tiene el maximo de % imagenes',
            NEW.codigo_asilo, k_max_imagenes
            USING ERRCODE = 'check_violation';
    END IF;

    -- La primera imagen que entra es la portada; asi nunca hay un asilo sin ella.
    IF COALESCE(v_hay_portada, FALSE) = FALSE THEN
        NEW.es_portada := TRUE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_imagenes_asilo_insertar
    BEFORE INSERT ON famtree.imagenes_asilo
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_imagenes_asilo_insertar();

-- Al marcar una imagen como portada, la anterior deja de serlo.
--
-- Tiene que ser BEFORE, no AFTER. PostgreSQL valida el indice unico parcial en
-- el momento de escribir la fila, ANTES de ejecutar cualquier trigger AFTER: con
-- un AFTER, el UPDATE choca contra la portada vieja (que sigue viva en el
-- indice) y el trigger que existe para despromoverla nunca llega a correr. El
-- resultado seria que cambiar la portada de un centro es imposible.
CREATE OR REPLACE FUNCTION famtree.fn_imagenes_asilo_portada_unica()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
BEGIN
    UPDATE famtree.imagenes_asilo
       SET es_portada = FALSE
     WHERE codigo_asilo = NEW.codigo_asilo
       AND codigo_imagen <> NEW.codigo_imagen
       AND es_portada;
    -- RETURN NEW y no NULL: en un BEFORE, devolver NULL descarta la fila en
    -- silencio y el cambio de portada se perderia sin error.
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_imagenes_asilo_portada_unica
    BEFORE UPDATE OF es_portada ON famtree.imagenes_asilo
    FOR EACH ROW WHEN (NEW.es_portada AND NOT OLD.es_portada)
    EXECUTE FUNCTION famtree.fn_imagenes_asilo_portada_unica();

-- RN06: al borrar la portada, la imagen mas antigua que quede toma su lugar.
CREATE OR REPLACE FUNCTION famtree.fn_imagenes_asilo_promover_portada()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
BEGIN
    IF NOT OLD.es_portada THEN
        RETURN NULL;
    END IF;
    -- Si el asilo entero se elimino, no hay nada que promover.
    IF NOT EXISTS (SELECT 1 FROM famtree.asilos WHERE codigo_asilo = OLD.codigo_asilo) THEN
        RETURN NULL;
    END IF;

    UPDATE famtree.imagenes_asilo
       SET es_portada = TRUE
     WHERE codigo_imagen = (
            SELECT codigo_imagen
              FROM famtree.imagenes_asilo
             WHERE codigo_asilo = OLD.codigo_asilo
             ORDER BY fecha_creacion, codigo_imagen
             LIMIT 1);
    RETURN NULL;
END;
$$;

CREATE TRIGGER tg_imagenes_asilo_promover_portada
    AFTER DELETE ON famtree.imagenes_asilo
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_imagenes_asilo_promover_portada();


-- ------------ RN06/RN10: todo asilo declara imagen, tipos y servicios (1,N) --
-- La cardinalidad minima 1 no la garantiza ninguna FK: al insertar el asilo
-- todavia no existen sus filas asociativas. Se usa un CONSTRAINT TRIGGER
-- diferido, que se evalua al hacer COMMIT, cuando la transaccion ya cargo todo.
CREATE OR REPLACE FUNCTION famtree.fn_asilo_catalogos_minimos()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_asilo BIGINT := COALESCE(NEW.codigo_asilo, OLD.codigo_asilo);
BEGIN
    -- Si el asilo desaparecio en esta misma transaccion, no hay nada que exigir.
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

CREATE CONSTRAINT TRIGGER tg_asilos_catalogos_minimos
    AFTER INSERT ON famtree.asilos
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_asilo_catalogos_minimos();

CREATE CONSTRAINT TRIGGER tg_asilos_tipos_minimos
    AFTER DELETE ON famtree.asilos_tipos_adulto
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_asilo_catalogos_minimos();

CREATE CONSTRAINT TRIGGER tg_asilos_servicios_minimos
    AFTER DELETE ON famtree.asilos_servicios
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_asilo_catalogos_minimos();

CREATE CONSTRAINT TRIGGER tg_asilos_imagenes_minimas
    AFTER DELETE ON famtree.imagenes_asilo
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_asilo_catalogos_minimos();


-- --------------------- atributos de rol y preferencias automaticas (HU39/45) --
-- Al crear una cuenta ADMIN_ASILO (o convertir otra cuenta a ese rol), la clave
-- es temporal. Una vez cambiada, la misma cuenta puede guardar FALSE sin que el
-- trigger la fuerce de nuevo a TRUE.
CREATE OR REPLACE FUNCTION famtree.fn_usuario_validar_alta_admin_asilo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
BEGIN
    IF NEW.rol = 'ADMIN_ASILO'
       AND (TG_OP = 'INSERT' OR OLD.rol IS DISTINCT FROM 'ADMIN_ASILO')
       AND NEW.requiere_cambio_clave = FALSE THEN
        RAISE EXCEPTION 'RN02: un ADMIN_ASILO nuevo debe cambiar su clave temporal'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_usuarios_validar_alta_admin_asilo
    BEFORE INSERT OR UPDATE OF rol ON famtree.usuarios
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_usuario_validar_alta_admin_asilo();

-- En el diagrama de clases la relacion 1:1 corresponde exclusivamente al
-- subtipo UsuarioRegistrado. Se crea al entrar en ese rol y se elimina al salir.
CREATE OR REPLACE FUNCTION famtree.fn_usuario_sincronizar_preferencias()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
BEGIN
    IF NEW.rol = 'USUARIO_REGISTRADO' THEN
        INSERT INTO famtree.preferencias_notificacion (codigo_usuario)
        VALUES (NEW.codigo_usuario)
        ON CONFLICT (codigo_usuario) DO NOTHING;
    ELSIF TG_OP = 'UPDATE' THEN
        DELETE FROM famtree.preferencias_notificacion
         WHERE codigo_usuario = NEW.codigo_usuario;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER tg_usuarios_sincronizar_preferencias
    AFTER INSERT OR UPDATE OF rol ON famtree.usuarios
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_usuario_sincronizar_preferencias();

-- Impide saltarse la especializacion insertando preferencias por SQL directo.
CREATE OR REPLACE FUNCTION famtree.fn_preferencia_solo_usuario_registrado()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_rol famtree.rol_usuario;
BEGIN
    SELECT rol INTO v_rol
      FROM famtree.usuarios
     WHERE codigo_usuario = NEW.codigo_usuario;
    IF v_rol IS DISTINCT FROM 'USUARIO_REGISTRADO' THEN
        RAISE EXCEPTION 'RN16: preferencias_notificacion pertenece solo a USUARIO_REGISTRADO (usuario % es %)',
            NEW.codigo_usuario, v_rol USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_preferencias_solo_registrado
    BEFORE INSERT OR UPDATE OF codigo_usuario ON famtree.preferencias_notificacion
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_preferencia_solo_usuario_registrado();


-- ---------------------------------------------- RN12/RN13: bloqueo de cuentas --
CREATE OR REPLACE FUNCTION famtree.fn_bloqueo_validar()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_rol_objetivo    famtree.rol_usuario;
    v_rol_admin       famtree.rol_usuario;
    v_rol_desbloqueo  famtree.rol_usuario;
BEGIN
    SELECT rol INTO v_rol_objetivo FROM famtree.usuarios WHERE codigo_usuario = NEW.codigo_usuario;
    SELECT rol INTO v_rol_admin    FROM famtree.usuarios WHERE codigo_usuario = NEW.codigo_admin_bloqueo;

    IF v_rol_admin <> 'ADMIN_SISTEMA' THEN
        RAISE EXCEPTION 'RN12: solo un ADMIN_SISTEMA puede bloquear cuentas (usuario % es %)',
            NEW.codigo_admin_bloqueo, v_rol_admin USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF v_rol_objetivo = 'ADMIN_SISTEMA' THEN
        RAISE EXCEPTION 'RN12: no se puede bloquear la cuenta de otro ADMIN_SISTEMA (usuario %)',
            NEW.codigo_usuario USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NEW.codigo_admin_desbloqueo IS NOT NULL THEN
        SELECT rol INTO v_rol_desbloqueo
          FROM famtree.usuarios WHERE codigo_usuario = NEW.codigo_admin_desbloqueo;
        IF v_rol_desbloqueo <> 'ADMIN_SISTEMA' THEN
            RAISE EXCEPTION 'RN12: solo un ADMIN_SISTEMA puede desbloquear cuentas (usuario % es %)',
                NEW.codigo_admin_desbloqueo, v_rol_desbloqueo USING ERRCODE = 'insufficient_privilege';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_bloqueos_validar
    BEFORE INSERT OR UPDATE ON famtree.bloqueos_usuario
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_bloqueo_validar();

-- usuarios.estado es un espejo del bloqueo vigente. Mantenerlo por trigger evita
-- el caso clasico de "cuenta marcada como activa con un bloqueo abierto".
CREATE OR REPLACE FUNCTION famtree.fn_bloqueo_sincronizar_estado()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_usuario BIGINT := COALESCE(NEW.codigo_usuario, OLD.codigo_usuario);
BEGIN
    UPDATE famtree.usuarios u
       SET estado = CASE
            WHEN EXISTS (SELECT 1 FROM famtree.bloqueos_usuario b
                          WHERE b.codigo_usuario = v_usuario
                            AND b.fecha_desbloqueo IS NULL)
            THEN 'BLOQUEADO'::famtree.estado_usuario
            ELSE 'ACTIVO'::famtree.estado_usuario
        END
     WHERE u.codigo_usuario = v_usuario
       AND u.estado IS DISTINCT FROM CASE
            WHEN EXISTS (SELECT 1 FROM famtree.bloqueos_usuario b
                          WHERE b.codigo_usuario = v_usuario
                            AND b.fecha_desbloqueo IS NULL)
            THEN 'BLOQUEADO'::famtree.estado_usuario
            ELSE 'ACTIVO'::famtree.estado_usuario
        END;
    RETURN NULL;
END;
$$;

CREATE TRIGGER tg_bloqueos_sincronizar_estado
    AFTER INSERT OR UPDATE OR DELETE ON famtree.bloqueos_usuario
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_bloqueo_sincronizar_estado();


-- ------------------------------------------ RN14: quien modera un reporte ---
CREATE OR REPLACE FUNCTION famtree.fn_reporte_validar()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_rol_moderador    famtree.rol_usuario;
    v_rol_denunciante  famtree.rol_usuario;
    v_autor            BIGINT;
BEGIN
    -- Nadie reporta su propia resena.
    SELECT codigo_usuario INTO v_autor
      FROM famtree.resenas WHERE codigo_resena = NEW.codigo_resena;
    IF v_autor = NEW.codigo_denunciante THEN
        RAISE EXCEPTION 'Un usuario no puede reportar su propia resena (resena %)',
            NEW.codigo_resena USING ERRCODE = 'check_violation';
    END IF;

    IF TG_OP = 'INSERT' OR NEW.codigo_denunciante IS DISTINCT FROM OLD.codigo_denunciante THEN
        SELECT rol INTO v_rol_denunciante
          FROM famtree.usuarios WHERE codigo_usuario = NEW.codigo_denunciante;
        IF v_rol_denunciante <> 'USUARIO_REGISTRADO' THEN
            RAISE EXCEPTION 'RN16: solo un USUARIO_REGISTRADO puede reportar resenas (usuario % es %)',
                NEW.codigo_denunciante, v_rol_denunciante
                USING ERRCODE = 'insufficient_privilege';
        END IF;
    END IF;

    IF NEW.codigo_moderador IS NOT NULL THEN
        SELECT rol INTO v_rol_moderador
          FROM famtree.usuarios WHERE codigo_usuario = NEW.codigo_moderador;
        IF v_rol_moderador <> 'ADMIN_SISTEMA' THEN
            RAISE EXCEPTION 'RN14: solo un ADMIN_SISTEMA resuelve reportes (usuario % es %)',
                NEW.codigo_moderador, v_rol_moderador USING ERRCODE = 'insufficient_privilege';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_reportes_validar
    BEFORE INSERT OR UPDATE ON famtree.reportes_resena
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_reporte_validar();

-- El modelo actualizado especifica borrado definitivo: al resolver con
-- RESENA_ELIMINADA se borra la resena. La FK ON DELETE CASCADE elimina tambien
-- sus reportes y notificaciones dependientes, incluido el reporte que origino
-- el veredicto.
CREATE OR REPLACE FUNCTION famtree.fn_reporte_eliminar_resena()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
BEGIN
    DELETE FROM famtree.resenas
     WHERE codigo_resena = NEW.codigo_resena;
    RETURN NULL;
END;
$$;

CREATE TRIGGER tg_reportes_eliminar_resena
    AFTER UPDATE OF estado_reporte ON famtree.reportes_resena
    FOR EACH ROW
    WHEN (NEW.estado_reporte = 'RESENA_ELIMINADA' AND
          OLD.estado_reporte IS DISTINCT FROM NEW.estado_reporte)
    EXECUTE FUNCTION famtree.fn_reporte_eliminar_resena();


-- --------------------------- RN15: la notificacion respeta las preferencias --
-- Se descarta en silencio en vez de fallar: el emisor (un cambio de estado de un
-- asilo, por ejemplo) no tiene por que conocer las preferencias de cada
-- destinatario, y un error abortaria la operacion que la origino.
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

CREATE TRIGGER tg_notificaciones_preferencias
    BEFORE INSERT ON famtree.notificaciones
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_notificacion_respeta_preferencias();


-- ------------------ RN16: solo un usuario registrado interactua con el sitio --
-- Un ADMIN_ASILO o ADMIN_SISTEMA no publica resenas ni guarda favoritos: eso
-- falsearia la calificacion de los centros. Reportes, preferencias y
-- notificaciones se validan en sus funciones especializadas de arriba.
CREATE OR REPLACE FUNCTION famtree.fn_solo_usuario_registrado()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = famtree, public, pg_temp AS
$$
DECLARE
    v_rol famtree.rol_usuario;
BEGIN
    SELECT rol INTO v_rol FROM famtree.usuarios WHERE codigo_usuario = NEW.codigo_usuario;
    IF v_rol <> 'USUARIO_REGISTRADO' THEN
        RAISE EXCEPTION 'RN16: % esta reservado al rol USUARIO_REGISTRADO (usuario % es %)',
            TG_TABLE_NAME, NEW.codigo_usuario, v_rol USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_resenas_solo_registrado
    BEFORE INSERT ON famtree.resenas
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_solo_usuario_registrado();

CREATE TRIGGER tg_favoritos_solo_registrado
    BEFORE INSERT ON famtree.favoritos
    FOR EACH ROW EXECUTE FUNCTION famtree.fn_solo_usuario_registrado();


-- =============================================================================
-- VISTAS
-- =============================================================================
-- La calificacion promedio es un dato DERIVADO: se calcula, no se almacena.
-- Guardarlo en asilos seria denormalizar y abriria la puerta a que el promedio
-- quede desfasado de sus resenas.

CREATE OR REPLACE VIEW famtree.vw_asilos_calificacion AS
SELECT a.codigo_asilo,
       count(r.codigo_resena)                                  AS total_resenas,
       round(avg(r.calificacion)::numeric, 2)                  AS calificacion_promedio,
       count(*) FILTER (WHERE r.calificacion = 5)              AS cinco_estrellas,
       max(r.fecha_publicacion)                                AS ultima_resena
  FROM famtree.asilos a
  LEFT JOIN famtree.resenas r
         ON r.codigo_asilo  = a.codigo_asilo
        AND r.estado_resena = 'PUBLICADA'
 GROUP BY a.codigo_asilo;

-- Lo que consume el catalogo publico y el mapa, ya resuelto en una sola lectura.
CREATE OR REPLACE VIEW famtree.vw_asilos_publicos AS
SELECT a.codigo_asilo,
       a.nombre_asilo,
       a.sector_asilo,
       a.direccion_asilo,
       m.nombre_municipio,
       p.nombre_provincia,
       a.latitud,
       a.longitud,
       a.capacidad_total,
       a.precio_minimo,
       a.precio_maximo,
       a.telefono_asilo,
       a.email_asilo,
       a.sitio_web,
       (SELECT i.url
          FROM famtree.imagenes_asilo i
         WHERE i.codigo_asilo = a.codigo_asilo AND i.es_portada
         LIMIT 1)                                              AS url_portada,
       c.total_resenas,
       c.calificacion_promedio,
       (SELECT array_agg(s.nombre_servicio ORDER BY s.nombre_servicio)
          FROM famtree.asilos_servicios asv
          JOIN famtree.servicios s ON s.codigo_servicio = asv.codigo_servicio
         WHERE asv.codigo_asilo = a.codigo_asilo)              AS servicios,
       (SELECT array_agg(t.nombre_tipo ORDER BY t.nombre_tipo)
          FROM famtree.asilos_tipos_adulto ata
          JOIN famtree.tipos_adulto_mayor t ON t.codigo_tipo = ata.codigo_tipo
         WHERE ata.codigo_asilo = a.codigo_asilo)              AS tipos_adulto_mayor
  FROM famtree.asilos a
  JOIN famtree.municipios m ON m.codigo_municipio = a.codigo_municipio
  JOIN famtree.provincias p ON p.codigo_provincia = m.codigo_provincia
  LEFT JOIN famtree.vw_asilos_calificacion c ON c.codigo_asilo = a.codigo_asilo
 WHERE a.estado_asilo = 'ACTIVO';


-- =============================================================================
-- DOCUMENTACION EN CATALOGO
-- =============================================================================
COMMENT ON SCHEMA famtree IS 'FamTree - directorio de centros de atencion al adulto mayor';

COMMENT ON TABLE famtree.provincias                IS 'Catalogo de provincias. Extraido de asilos para eliminar la dependencia transitiva (3FN)';
COMMENT ON TABLE famtree.municipios                IS 'Catalogo de municipios, dependiente de provincias';
COMMENT ON TABLE famtree.tipos_adulto_mayor        IS 'Catalogo de perfiles de residente que un centro puede atender';
COMMENT ON TABLE famtree.servicios                 IS 'Catalogo de servicios que un centro puede ofrecer';
COMMENT ON TABLE famtree.asilos                    IS 'Centro de atencion. Baja logica via estado_asilo, nunca DELETE (RN05)';
COMMENT ON TABLE famtree.imagenes_asilo            IS 'Galeria del centro. Entre 1 y 15 imagenes, exactamente una portada (RN06, RN07)';
COMMENT ON TABLE famtree.asilos_tipos_adulto       IS 'Asociativa: resuelve el muchos a muchos asilos <-> tipos_adulto_mayor';
COMMENT ON TABLE famtree.asilos_servicios          IS 'Asociativa: resuelve el muchos a muchos asilos <-> servicios';
COMMENT ON TABLE famtree.usuarios                  IS 'Cuentas de la plataforma en sus tres roles';
COMMENT ON TABLE famtree.preferencias_notificacion IS 'Relacion 1:1 exclusiva del USUARIO_REGISTRADO. Se sincroniza con el rol';
COMMENT ON TABLE famtree.bloqueos_usuario          IS 'Historial de bloqueos. HU34/HU35 exigen quien, cuando y por que';
COMMENT ON TABLE famtree.resenas                   IS 'Una resena por usuario y asilo (RN08)';
COMMENT ON TABLE famtree.reportes_resena           IS 'Denuncias de resenas y su moderacion';
COMMENT ON TABLE famtree.favoritos                 IS 'Asilos guardados por un usuario registrado';
COMMENT ON TABLE famtree.notificaciones            IS 'Avisos al usuario. Origen tipado con FK reales, no polimorfico';

COMMENT ON COLUMN famtree.usuarios.password_hash          IS 'Hash Argon2id. Nunca la contrasena en claro';
COMMENT ON COLUMN famtree.usuarios.requiere_cambio_clave  IS 'TRUE mientras el ADMIN_ASILO no cambie la clave temporal (HU40)';
COMMENT ON COLUMN famtree.usuarios.estado                 IS 'Espejo del bloqueo vigente. Lo mantiene tg_bloqueos_sincronizar_estado';
COMMENT ON COLUMN famtree.asilos.estado_asilo             IS 'INACTIVO sale del catalogo, del mapa y de las busquedas (RN05)';
COMMENT ON COLUMN famtree.resenas.fecha_actualizacion     IS 'NULL mientras la resena nunca se edito';
COMMENT ON COLUMN famtree.notificaciones.codigo_asilo     IS 'Origen del aviso cuando el evento es de un centro. Excluyente con codigo_resena';
COMMENT ON COLUMN famtree.notificaciones.codigo_resena    IS 'Origen del aviso cuando el evento es de moderacion. Excluyente con codigo_asilo';

COMMENT ON VIEW famtree.vw_asilos_calificacion IS 'Promedio y conteo de resenas publicadas. Dato derivado, nunca almacenado';
COMMENT ON VIEW famtree.vw_asilos_publicos     IS 'Proyeccion lista para el catalogo publico y el mapa';


-- =============================================================================
-- ROLES Y PERMISOS
-- =============================================================================
-- Roles de grupo sin login. El usuario real de la aplicacion se crea aparte,
-- con su contrasena, y hereda de famtree_app:
--   CREATE ROLE famtree_api LOGIN PASSWORD '...' IN ROLE famtree_app;
-- La aplicacion NUNCA debe conectarse como superusuario ni como dueno del esquema.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'famtree_app') THEN
        CREATE ROLE famtree_app NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'famtree_lectura') THEN
        CREATE ROLE famtree_lectura NOLOGIN;
    END IF;
END
$$;

REVOKE CREATE ON SCHEMA famtree FROM PUBLIC;

GRANT USAGE ON SCHEMA famtree TO famtree_app, famtree_lectura;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA famtree TO famtree_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA famtree TO famtree_app;
GRANT SELECT ON ALL TABLES IN SCHEMA famtree TO famtree_lectura;

ALTER DEFAULT PRIVILEGES IN SCHEMA famtree
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO famtree_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA famtree
    GRANT USAGE ON SEQUENCES TO famtree_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA famtree
    GRANT SELECT ON TABLES TO famtree_lectura;

-- Los catalogos no se tocan desde la aplicacion, solo se leen.
REVOKE INSERT, UPDATE, DELETE ON famtree.provincias, famtree.municipios FROM famtree_app;

-- Historiales de auditoria: se escriben y se cierran, nunca se borran. Sin este
-- REVOKE, el rol de la aplicacion podia eliminar justo los registros que HU34,
-- HU35 y RN14 exigen conservar. El borrado en cascada legitimo (al eliminar una
-- resena se van sus reportes) sigue funcionando: las acciones referenciales de
-- una FK no pasan por el control de permisos del rol que ejecuta la sentencia.
REVOKE DELETE ON famtree.bloqueos_usuario, famtree.reportes_resena FROM famtree_app;

COMMIT;
