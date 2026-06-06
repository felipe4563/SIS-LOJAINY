import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const obtenerPerfil = async (req, res) => {
  const { id_usuario } = req.user;
  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.usuario, u.correo, u.ci, u.id_rol, r.nombre AS nombre_rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [id_usuario]
    );
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

export const actualizarPerfil = async (req, res) => {
  const { id_usuario } = req.user;
  const { nombre, apellido, usuario, correo, ci } = req.body;

  if (!nombre?.trim() || !usuario?.trim()) {
    return res.status(400).json({ message: 'Nombre y usuario son requeridos' });
  }

  try {
    await db.query(
      `UPDATE usuarios SET nombre = ?, apellido = ?, usuario = ?, correo = ?, ci = ? WHERE id_usuario = ?`,
      [nombre.trim(), apellido?.trim() || null, usuario.trim(), correo?.trim() || null, ci?.trim() || null, id_usuario]
    );
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage?.includes('usuario')) return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso' });
      if (err.sqlMessage?.includes('correo'))  return res.status(409).json({ message: 'Ese correo ya está registrado' });
      if (err.sqlMessage?.includes('ci'))      return res.status(409).json({ message: 'Esa cédula ya está registrada' });
      return res.status(409).json({ message: 'Dato duplicado, verifica los campos' });
    }
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

export const cambiarPassword = async (req, res) => {
  const { id_usuario } = req.user;
  const { password_actual, nueva_password } = req.body;

  if (!password_actual || !nueva_password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }
  if (nueva_password.length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [rows] = await db.query(`SELECT password FROM usuarios WHERE id_usuario = ?`, [id_usuario]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password_actual, rows[0].password);
    if (!match) return res.status(400).json({ message: 'La contraseña actual es incorrecta' });

    const hashed = await bcrypt.hash(nueva_password, 10);
    await db.query(`UPDATE usuarios SET password = ? WHERE id_usuario = ?`, [hashed, id_usuario]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};
