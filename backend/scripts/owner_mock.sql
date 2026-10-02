-- Datos ficticios del owner, adaptados al esquema vigente.
-- Ejecutar mediante: python -m scripts.seed_owner_mock
-- No incluye contraseñas: se generan localmente con Argon2id.

INSERT INTO famtree.asilos (codigo_municipio, nombre_asilo, descripcion_asilo, sector_asilo, direccion_asilo, latitud, longitud, capacidad_total, precio_minimo, precio_maximo, requisitos_ingreso, certificaciones, telefono_asilo, email_asilo, sitio_web, estado_asilo)
SELECT seed.codigo_municipio, seed.nombre_asilo, seed.descripcion_asilo, seed.sector_asilo, seed.direccion_asilo, seed.latitud, seed.longitud, seed.capacidad_total, seed.precio_minimo, seed.precio_maximo, seed.requisitos_ingreso, seed.certificaciones, seed.telefono_asilo, seed.email_asilo, seed.sitio_web, seed.estado_asilo::famtree.estado_asilo
FROM (VALUES (
    (SELECT codigo_municipio FROM famtree.municipios WHERE nombre_municipio = 'Santo Domingo de Guzmán' LIMIT 1),
    'Residencia San José',
    'Centro integral especializado en el cuidado y atención con calidez para el adulto mayor, ofreciendo servicios médicos 24/7 y ambientes acondicionados.',
    'Gazcue',
    'Av. Independencia 102',
    18.468200,
    -69.897200,
    50,
    35000.00,
    60000.00,
    'Certificado médico reciente, evaluación psicológica y documento de identidad del tutor legal.',
    'Licencia de Operación MSP / Acreditación Geriátrica RD',
    '8095550101',
    'contacto@example.invalid',
    'https://sanjose.org',
    'ACTIVO'
),
(
    (SELECT codigo_municipio FROM famtree.municipios WHERE nombre_municipio = 'Santiago de los Caballeros' LIMIT 1),
    'Hogar San Francisco de Asís',
    'Hogar dedicado a proporcionar excelente calidad de vida mediante terapias ocupacionales, acompañamiento espiritual y nutrición adecuada.',
    'Los Colegios',
    'Calle Sol 45',
    19.451700,
    -70.697000,
    40,
    28000.00,
    45000.00,
    'Copia de cédula, récord médico actualizado y análisis clínicos de laboratorio.',
    'Permiso del Servicio Nacional de Salud',
    '8095550102',
    'info@example.invalid',
    'https://sanfrancisco.org',
    'ACTIVO'
),
(
    (SELECT codigo_municipio FROM famtree.municipios WHERE nombre_municipio = 'Santo Domingo Este' LIMIT 1),
    'Residencia Senior Dorada',
    'Residencia privada de estancia temporal y permanente, con infraestructura moderna, áreas verdes y asistencia personalizada.',
    'Alma Rosa I',
    'Av. San Vicente de Paúl 50',
    18.490000,
    -69.850000,
    30,
    40000.00,
    75000.00,
    'Evaluación geriátrica previa, formulario de admisión firmado y depósito de garantía.',
    'Certificado de Seguridad Sanitaria Geriátrica',
    '8095550103',
    'servicio@example.invalid',
    'https://seniordorada.com',
    'ACTIVO'
)) AS seed (codigo_municipio, nombre_asilo, descripcion_asilo, sector_asilo, direccion_asilo, latitud, longitud, capacidad_total, precio_minimo, precio_maximo, requisitos_ingreso, certificaciones, telefono_asilo, email_asilo, sitio_web, estado_asilo)
WHERE NOT EXISTS (SELECT 1 FROM famtree.asilos AS target WHERE target.nombre_asilo = seed.nombre_asilo);

INSERT INTO famtree.imagenes_asilo (codigo_asilo, url, es_portada)
SELECT seed.codigo_asilo, seed.url, seed.es_portada
FROM (VALUES ((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), 'https://i.pinimg.com/736x/f4/5d/3e/f45d3e751be6b4993f176bcb37aa910c.jpg', TRUE),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), 'https://i.pinimg.com/1200x/9a/57/9d/9a579d288be16cd49e494717634ad22d.jpg', FALSE),


((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'), 'https://i.pinimg.com/736x/3e/3a/37/3e3a378cd96676635ff55121ef102831.jpg', TRUE),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'), 'https://i.pinimg.com/736x/c4/3b/43/c43b43833b13c8abbee5d5e85c31ed10.jpg', FALSE),


((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia Senior Dorada'), 'https://i.pinimg.com/736x/f6/d3/87/f6d387ecac1fc7806fbe52d3fa1c4aac.jpg', TRUE)) AS seed (codigo_asilo, url, es_portada)
WHERE NOT EXISTS (SELECT 1 FROM famtree.imagenes_asilo AS target WHERE target.codigo_asilo = seed.codigo_asilo AND target.url = seed.url);

INSERT INTO famtree.asilos_tipos_adulto (codigo_asilo, codigo_tipo)
SELECT seed.codigo_asilo, seed.codigo_tipo
FROM (VALUES ((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), (SELECT codigo_tipo FROM famtree.tipos_adulto_mayor WHERE nombre_tipo = 'Adulto mayor independiente')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), (SELECT codigo_tipo FROM famtree.tipos_adulto_mayor WHERE nombre_tipo = 'Movilidad reducida')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), (SELECT codigo_tipo FROM famtree.tipos_adulto_mayor WHERE nombre_tipo = 'Cuidado permanente')),

((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'), (SELECT codigo_tipo FROM famtree.tipos_adulto_mayor WHERE nombre_tipo = 'Adulto mayor independiente')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'), (SELECT codigo_tipo FROM famtree.tipos_adulto_mayor WHERE nombre_tipo = 'Discapacidad física')),

((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia Senior Dorada'), (SELECT codigo_tipo FROM famtree.tipos_adulto_mayor WHERE nombre_tipo = 'Movilidad reducida')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia Senior Dorada'), (SELECT codigo_tipo FROM famtree.tipos_adulto_mayor WHERE nombre_tipo = 'Condiciones cognitivas'))) AS seed (codigo_asilo, codigo_tipo)
WHERE NOT EXISTS (SELECT 1 FROM famtree.asilos_tipos_adulto AS target WHERE target.codigo_asilo = seed.codigo_asilo AND target.codigo_tipo = seed.codigo_tipo);

INSERT INTO famtree.asilos_servicios (codigo_asilo, codigo_servicio)
SELECT seed.codigo_asilo, seed.codigo_servicio
FROM (VALUES ((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Alimentación')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Enfermería 24 horas')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Administración de medicamentos')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Fisioterapia')),

((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Alimentación')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Atención médica')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Recreación y actividades')),

((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia Senior Dorada'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Alimentación')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia Senior Dorada'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Enfermería 24 horas')),
((SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia Senior Dorada'), (SELECT codigo_servicio FROM famtree.servicios WHERE nombre_servicio = 'Terapia ocupacional'))) AS seed (codigo_asilo, codigo_servicio)
WHERE NOT EXISTS (SELECT 1 FROM famtree.asilos_servicios AS target WHERE target.codigo_asilo = seed.codigo_asilo AND target.codigo_servicio = seed.codigo_servicio);

INSERT INTO famtree.usuarios (nombre_usuario, apellido_usuario, username, email, password_hash, rol, requiere_cambio_clave)
SELECT seed.nombre_usuario, seed.apellido_usuario, seed.username, seed.email, seed.password_hash, seed.rol::famtree.rol_usuario, seed.requiere_cambio_clave
FROM (VALUES (
    'Sistema', 'Admin', 'admin.sistema', 'admin.sistema@example.invalid',
    :password_hash, 'ADMIN_SISTEMA', FALSE
)) AS seed (nombre_usuario, apellido_usuario, username, email, password_hash, rol, requiere_cambio_clave)
WHERE NOT EXISTS (SELECT 1 FROM famtree.usuarios AS target WHERE target.username = seed.username);

INSERT INTO famtree.usuarios (codigo_asilo_asignado, nombre_usuario, apellido_usuario, username, email, telefono, password_hash, rol, requiere_cambio_clave)
SELECT seed.codigo_asilo_asignado, seed.nombre_usuario, seed.apellido_usuario, seed.username, seed.email, seed.telefono, seed.password_hash, seed.rol::famtree.rol_usuario, seed.requiere_cambio_clave
FROM (VALUES (
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'),
    'Carlos', 'Martinez', 'admin.sanjose', 'admin.sanjose@example.invalid', '8095551001',
    :password_hash, 'ADMIN_ASILO', TRUE
),
(
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'),
    'Laura', 'Perez', 'admin.sanfran', 'admin.sanfran@example.invalid', '8095551002',
    :password_hash, 'ADMIN_ASILO', TRUE
)) AS seed (codigo_asilo_asignado, nombre_usuario, apellido_usuario, username, email, telefono, password_hash, rol, requiere_cambio_clave)
WHERE NOT EXISTS (SELECT 1 FROM famtree.usuarios AS target WHERE target.username = seed.username);

INSERT INTO famtree.usuarios (nombre_usuario, apellido_usuario, username, email, foto_perfil, descripcion, password_hash, rol)
SELECT seed.nombre_usuario, seed.apellido_usuario, seed.username, seed.email, seed.foto_perfil, seed.descripcion, seed.password_hash, seed.rol::famtree.rol_usuario
FROM (VALUES (
    'Alejandro', 'Jimenez', 'alejandro.j', 'alejandro.jimenez@example.invalid',
    'https://i.pinimg.com/1200x/a8/da/b5/a8dab5e39e8bed0d8b2b096a670cd977.jpg',
    'Buscando las mejores opciones de cuidado para mis familiares.',
    :password_hash, 'USUARIO_REGISTRADO'
),

(
    'Gabriel', 'Morales', 'gabriel.morales', 'gabriel.morales@example.invalid',
    'https://i.pinimg.com/1200x/6e/ff/7b/6eff7be76afe293b793aa4358e144a28.jpg',
    'Familiar interesado en centros con atención geriátrica especializada.',
    :password_hash, 'USUARIO_REGISTRADO'
),

(
    'Elena', 'Castillo', 'elena.castillo', 'elena.castillo@example.invalid',
    'https://i.pinimg.com/1200x/e2/2d/2c/e22d2c26c3746d1a9379d2c2409946bf.jpg',
    'Interesada en residencias con programas de terapia física.',
    :password_hash, 'USUARIO_REGISTRADO'
),

(
    'Sofia', 'Peralta', 'sofia.peralta', 'sofia.peralta@example.invalid',
    'https://i.pinimg.com/736x/d5/2f/ea/d52fead5cae1d4cff9f1f9a40166c865.jpg',
    'Evaluando residencias en Santo Domingo para mis padres.',
    :password_hash, 'USUARIO_REGISTRADO'
),

(
    'Maria', 'Fernandez', 'maria.fernandez', 'maria.fernandez@example.invalid',
    'https://i.pinimg.com/1200x/0d/89/07/0d89076937d22fc01779f9123a38bc68.jpg',
    'Buscando espacios tranquilos y con buen ambiente comunitario.',
    :password_hash, 'USUARIO_REGISTRADO'
)) AS seed (nombre_usuario, apellido_usuario, username, email, foto_perfil, descripcion, password_hash, rol)
WHERE NOT EXISTS (SELECT 1 FROM famtree.usuarios AS target WHERE target.username = seed.username);

INSERT INTO famtree.resenas (codigo_usuario, codigo_asilo, calificacion, comentario, estado_resena)
SELECT seed.codigo_usuario, seed.codigo_asilo, seed.calificacion, seed.comentario, seed.estado_resena::famtree.estado_resena
FROM (VALUES (
    (SELECT codigo_usuario FROM famtree.usuarios WHERE username = 'alejandro.j'),
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'),
    5,
    'Excelente atención médica y un trato muy humano hacia los residentes. Las instalaciones están súper bien cuidadas.',
    'PUBLICADA'
),
(
    (SELECT codigo_usuario FROM famtree.usuarios WHERE username = 'elena.castillo'),
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José'),
    4,
    'Muy buena ubicación y espacio para actividades al aire libre. La comunicación con el personal es fluida.',
    'PUBLICADA'
),
(
    (SELECT codigo_usuario FROM famtree.usuarios WHERE username = 'gabriel.morales'),
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís'),
    5,
    'El personal de enfermería es extraordinario. El ambiente es pacífico y agradable.',
    'PUBLICADA'
)) AS seed (codigo_usuario, codigo_asilo, calificacion, comentario, estado_resena)
WHERE NOT EXISTS (SELECT 1 FROM famtree.resenas AS target WHERE target.codigo_usuario = seed.codigo_usuario AND target.codigo_asilo = seed.codigo_asilo);

INSERT INTO famtree.favoritos (codigo_usuario, codigo_asilo)
SELECT seed.codigo_usuario, seed.codigo_asilo
FROM (VALUES (
    (SELECT codigo_usuario FROM famtree.usuarios WHERE username = 'alejandro.j'),
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia San José')
),
(
    (SELECT codigo_usuario FROM famtree.usuarios WHERE username = 'alejandro.j'),
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Residencia Senior Dorada')
),
(
    (SELECT codigo_usuario FROM famtree.usuarios WHERE username = 'elena.castillo'),
    (SELECT codigo_asilo FROM famtree.asilos WHERE nombre_asilo = 'Hogar San Francisco de Asís')
)) AS seed (codigo_usuario, codigo_asilo)
WHERE NOT EXISTS (SELECT 1 FROM famtree.favoritos AS target WHERE target.codigo_usuario = seed.codigo_usuario AND target.codigo_asilo = seed.codigo_asilo);
