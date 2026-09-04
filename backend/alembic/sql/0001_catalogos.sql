-- =============================================================================
-- FamTree - Datos de catalogo
-- =============================================================================
-- Estos datos son parte del sistema, no de las pruebas: sin ellos no se puede
-- registrar un asilo. Se ejecuta despues de 01_schema.sql y es idempotente:
-- correrlo dos veces no duplica nada.
-- =============================================================================

\set ON_ERROR_STOP on
SET search_path = famtree, public;

BEGIN;

-- ------------------------------------------------- provincias (Rep. Dominicana)
INSERT INTO famtree.provincias (nombre_provincia) VALUES
    ('Azua'), ('Bahoruco'), ('Barahona'), ('Dajabón'), ('Distrito Nacional'),
    ('Duarte'), ('El Seibo'), ('Elías Piña'), ('Espaillat'), ('Hato Mayor'),
    ('Hermanas Mirabal'), ('Independencia'), ('La Altagracia'), ('La Romana'),
    ('La Vega'), ('María Trinidad Sánchez'), ('Monseñor Nouel'), ('Monte Cristi'),
    ('Monte Plata'), ('Pedernales'), ('Peravia'), ('Puerto Plata'), ('Samaná'),
    ('San Cristóbal'), ('San José de Ocoa'), ('San Juan'), ('San Pedro de Macorís'),
    ('Sánchez Ramírez'), ('Santiago'), ('Santiago Rodríguez'), ('Santo Domingo'),
    ('Valverde')
ON CONFLICT (nombre_provincia) DO NOTHING;

-- --------------------------------------------------------------- municipios --
-- Conjunto de trabajo: cabeceras y municipios de mayor poblacion. El resto se
-- carga con la division territorial completa de la ONE cuando haga falta.
INSERT INTO famtree.municipios (codigo_provincia, nombre_municipio)
SELECT p.codigo_provincia, m.nombre
  FROM (VALUES
    ('Distrito Nacional',      'Santo Domingo de Guzmán'),
    ('Santo Domingo',          'Santo Domingo Este'),
    ('Santo Domingo',          'Santo Domingo Norte'),
    ('Santo Domingo',          'Santo Domingo Oeste'),
    ('Santo Domingo',          'Los Alcarrizos'),
    ('Santo Domingo',          'Boca Chica'),
    ('Santo Domingo',          'Pedro Brand'),
    ('Santo Domingo',          'San Antonio de Guerra'),
    ('Santiago',               'Santiago de los Caballeros'),
    ('Santiago',               'Villa González'),
    ('Santiago',               'Tamboril'),
    ('Santiago',               'Licey al Medio'),
    ('Santiago',               'Navarrete'),
    ('La Vega',                'Concepción de La Vega'),
    ('La Vega',                'Constanza'),
    ('La Vega',                'Jarabacoa'),
    ('San Cristóbal',          'San Cristóbal'),
    ('San Cristóbal',          'Bajos de Haina'),
    ('San Cristóbal',          'Villa Altagracia'),
    ('Puerto Plata',           'San Felipe de Puerto Plata'),
    ('Puerto Plata',           'Sosúa'),
    ('Puerto Plata',           'Imbert'),
    ('Duarte',                 'San Francisco de Macorís'),
    ('Duarte',                 'Villa Riva'),
    ('La Romana',              'La Romana'),
    ('La Altagracia',          'Higüey'),
    ('La Altagracia',          'San Rafael del Yuma'),
    ('San Pedro de Macorís',   'San Pedro de Macorís'),
    ('Espaillat',              'Moca'),
    ('Monseñor Nouel',         'Bonao'),
    ('Sánchez Ramírez',        'Cotuí'),
    ('Peravia',                'Baní'),
    ('Azua',                   'Azua de Compostela'),
    ('Barahona',               'Santa Cruz de Barahona'),
    ('San Juan',               'San Juan de la Maguana'),
    ('Monte Plata',            'Monte Plata'),
    ('Valverde',               'Mao'),
    ('Samaná',                 'Santa Bárbara de Samaná'),
    ('María Trinidad Sánchez', 'Nagua'),
    ('Hato Mayor',             'Hato Mayor del Rey'),
    ('Monte Cristi',           'San Fernando de Monte Cristi'),
    ('Hermanas Mirabal',       'Salcedo')
  ) AS m(provincia, nombre)
  JOIN famtree.provincias p ON p.nombre_provincia = m.provincia
ON CONFLICT (codigo_provincia, nombre_municipio) DO NOTHING;

-- ------------------------------------------------------ tipos de adulto mayor
INSERT INTO famtree.tipos_adulto_mayor (nombre_tipo) VALUES
    ('Adulto mayor independiente'),
    ('Movilidad reducida'),
    ('Discapacidad física'),
    ('Cuidado permanente'),
    ('Condiciones cognitivas'),
    ('Cuidados especializados')
ON CONFLICT (nombre_tipo) DO NOTHING;

-- ------------------------------------------------------------------ servicios
INSERT INTO famtree.servicios (nombre_servicio) VALUES
    ('Alimentación'),
    ('Enfermería 24 horas'),
    ('Administración de medicamentos'),
    ('Fisioterapia'),
    ('Terapia ocupacional'),
    ('Atención médica'),
    ('Asistencia en higiene personal'),
    ('Recreación y actividades'),
    ('Transporte')
ON CONFLICT (nombre_servicio) DO NOTHING;

COMMIT;
