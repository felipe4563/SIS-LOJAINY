import db from '../config/db.js';
import bcrypt from 'bcrypt';

/**
 * Crear usuario
 */
export const crearUsuario = async (req, res) => {
  // req.body ya viene validado por crearUsuarioSchema
  const { nombre, apellido, usuario, ci, correo, password, id_rol, activo } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, usuario, ci, correo, password, id_rol, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido || null, usuario, ci || null, correo, hashedPassword, id_rol, activo]
    );

    res.status(201).json({ message: 'Usuario creado', id_usuario: result.insertId });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage?.includes('usuario')) return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso' });
      if (err.sqlMessage?.includes('correo'))  return res.status(409).json({ message: 'Ese correo ya está registrado' });
      if (err.sqlMessage?.includes('ci'))      return res.status(409).json({ message: 'Esa cédula ya está registrada' });
    }
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

/**
 * Listar todos los usuarios
 */
export const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.usuario, u.ci, u.correo, u.id_rol, u.activo, r.nombre AS nombre_rol
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

/**
 * Obtener usuario por ID
 */
export const obtenerUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id_usuario, nombre, apellido, usuario, ci, correo, id_rol, activo, fecha_registro
       FROM usuarios WHERE id_usuario = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

/**
 * Actualizar usuario
 */
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  // req.body ya viene validado por actualizarUsuarioSchema
  const { nombre, apellido, usuario, ci, correo, password, id_rol } = req.body;

  try {
    let query = 'UPDATE usuarios SET nombre = ?, apellido = ?, usuario = ?, ci = ?, correo = ?, id_rol = ?';
    const params = [nombre, apellido || null, usuario, ci || null, correo, id_rol];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id_usuario = ?';
    params.push(id);

    await db.query(query, params);

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage?.includes('usuario')) return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso' });
      if (err.sqlMessage?.includes('correo'))  return res.status(409).json({ message: 'Ese correo ya está registrado' });
      if (err.sqlMessage?.includes('ci'))      return res.status(409).json({ message: 'Esa cédula ya está registrada' });
    }
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

/**
 * Activar / Desactivar usuario
 */
export const toggleEstadoUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔒 Evitar que un usuario se desactive a sí mismo
    if (req.user.id_usuario === Number(id)) {
      return res.status(400).json({
        message: 'No puedes desactivar tu propio usuario'
      });
    }

    // Buscar estado actual
    const [rows] = await db.query(
      'SELECT activo FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Cambiar estado
    const nuevoEstado = rows[0].activo === 1 ? 0 : 1;

    await db.query(
      'UPDATE usuarios SET activo = ? WHERE id_usuario = ?',
      [nuevoEstado, id]
    );

    res.json({
      message: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'}`
    });

  } catch (err) {
    console.error('toggleEstadoUsuario error:', err);
    res.status(500).json({
      message: 'Error al actualizar estado del usuario'
    });
  }
};

