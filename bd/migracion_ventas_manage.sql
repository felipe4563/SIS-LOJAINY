-- Migración: agrega el permiso 'ventas.manage' faltante y lo asigna al rol administrador.
-- Ejecutar una sola vez sobre la base de datos existente (no se aplica solo).
-- No fuerza el id_permiso: deja que AUTO_INCREMENT le asigne uno libre,
-- por si en esta base de datos el id 18 ya está ocupado por otra cosa.

INSERT IGNORE INTO `permisos` (`nombre`) VALUES ('ventas.manage');

INSERT IGNORE INTO `rol_permisos` (`id_rol`, `id_permiso`)
SELECT 1, `id_permiso` FROM `permisos` WHERE `nombre` = 'ventas.manage';