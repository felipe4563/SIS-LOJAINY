import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { identificador, password } = req.body;

  try {
    // 1. Buscar usuario
    const [users] = await db.query(
      `SELECT u.*, r.nombre AS nombre_rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.correo = ? OR u.ci = ?`,
      [identificador, identificador]
    );

    if (users.length === 0) {
      // Constant-time dummy compare to prevent timing attacks
      await bcrypt.compare(password, '$2b$10$invalidhashtopreventtimingattackxxxxxxxxxxxxxxxxxxxxxxx');
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = users[0];

    // 2. Verificar password antes de revelar si el usuario está activo
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Credenciales incorrectas' });

    if (user.activo === 0)
      return res.status(403).json({ message: 'Tu cuenta está desactivada. Contacta al administrador.' });

    // 3. Obtener permisos del rol
    const [permisosRows] = await db.query(
      `SELECT p.nombre
       FROM rol_permisos rp
       JOIN permisos p ON rp.id_permiso = p.id_permiso
       WHERE rp.id_rol = ?`,
      [user.id_rol]
    );

    const permisos = permisosRows.map(p => p.nombre);

    // 4. Generar token CON permisos
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        id_rol: user.id_rol,
        permisos
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 5. Respuesta
    res.json({
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        ci: user.ci,
        id_rol: user.id_rol,
        nombre_rol: user.nombre_rol,
        permisos
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
