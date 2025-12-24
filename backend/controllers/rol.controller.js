import db from '../config/db.js';

/**
 * Crear rol y asignar permisos
 */
export const crearRol = async (req, res) => {
  try {
    // CASL / middleware: req.ability debe venir de initAbility
    if (!req.ability.can('manage', 'Rol')) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { nombre, permisos = [] } = req.body; // permisos = array de id_permiso

    // Crear rol
    const [result] = await db.query(`INSERT INTO roles (nombre) VALUES (?)`, [nombre]);
    const id_rol = result.insertId;

    // Asignar permisos al rol
    if (permisos.length > 0) {
      const valores = permisos.map(id_permiso => [id_rol, id_permiso]);
      await db.query(`INSERT INTO rol_permisos (id_rol, id_permiso) VALUES ?`, [valores]);
    }

    res.status(201).json({ message: 'Rol creado y permisos asignados', id_rol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear rol' });
  }
};

/**
 * Listar todos los roles
 */
export const listarRoles = async (req, res) => {
  try {
    if (!req.ability.can('read', 'Rol')) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const [roles] = await db.query(`SELECT * FROM roles ORDER BY id_rol ASC`);
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar roles' });
  }
};

/**
 * Obtener un rol por ID con sus permisos
 */
export const obtenerRol = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.ability.can('read', 'Rol')) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const [roles] = await db.query(`SELECT * FROM roles WHERE id_rol = ?`, [id]);
    if (roles.length === 0) return res.status(404).json({ message: 'Rol no encontrado' });

    const [permisos] = await db.query(
      `SELECT p.id_permiso, p.nombre 
       FROM permisos p
       INNER JOIN rol_permisos rp ON p.id_permiso = rp.id_permiso
       WHERE rp.id_rol = ?`,
      [id]
    );

    res.json({ ...roles[0], permisos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener rol' });
  }
};

/**
 * Actualizar rol y sus permisos
 */
export const actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre, permisos = [] } = req.body;

  try {
    if (!req.ability.can('manage', 'Rol')) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Actualizar nombre del rol
    await db.query(`UPDATE roles SET nombre = ? WHERE id_rol = ?`, [nombre, id]);

    // Actualizar permisos: borrar los anteriores y agregar los nuevos
    await db.query(`DELETE FROM rol_permisos WHERE id_rol = ?`, [id]);

    if (permisos.length > 0) {
      const valores = permisos.map(id_permiso => [id, id_permiso]);
      await db.query(`INSERT INTO rol_permisos (id_rol, id_permiso) VALUES ?`, [valores]);
    }

    res.json({ message: 'Rol y permisos actualizados' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};

/**
 * Eliminar rol y sus permisos
 */
export const eliminarRol = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.ability.can('manage', 'Rol')) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    await db.query(`DELETE FROM rol_permisos WHERE id_rol = ?`, [id]);
    await db.query(`DELETE FROM roles WHERE id_rol = ?`, [id]);

    res.json({ message: 'Rol eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar rol' });
  }
};
