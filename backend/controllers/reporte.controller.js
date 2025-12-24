import db from '../config/db.js';

/**
 * 📊 TOTAL VENDIDO POR MES
 * ?mes=8&anio=2025
 */
export const totalVendidoMes = async (req, res) => {
  const { mes, anio } = req.query;

  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') AS periodo,
        COUNT(id_venta) AS total_ventas,
        SUM(total) AS total_vendido
      FROM ventas
      WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?
    `, [mes, anio]);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en reporte mensual' });
  }
};

/**
 * 👤 VENTAS POR USUARIO
 */
export const ventasPorUsuario = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id_usuario,
        CONCAT(u.nombre, ' ', u.apellido) AS usuario,
        COUNT(v.id_venta) AS cantidad_ventas,
        SUM(v.total) AS total_vendido
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      GROUP BY u.id_usuario
      ORDER BY total_vendido DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error reporte por usuario' });
  }
};

/**
 * 💳 VENTAS POR MÉTODO DE PAGO
 */
export const ventasPorMetodoPago = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        metodo_pago,
        COUNT(id_venta) AS cantidad,
        SUM(total) AS total
      FROM ventas
      GROUP BY metodo_pago
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error reporte por método de pago' });
  }
};

/**
 * 📦 PRODUCTOS CON STOCK DISPONIBLE
 */
export const productosEnStock = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id_producto,
        p.descripcion,
        p.precio,
        p.stock,
        c.nombre AS categoria,
        co.nombre AS color,
        t.nombre AS talla
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN color co ON p.id_color = co.id_color
      LEFT JOIN tallas t ON p.id_talla = t.id_talla
      WHERE p.stock > 0
      ORDER BY p.stock ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error productos en stock' });
  }
};

/**
 * 🔥 TOP PRODUCTOS MÁS VENDIDOS
 */
export const topProductosVendidos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id_producto,
        p.descripcion,
        COUNT(dv.id_producto) AS veces_vendido,
        SUM(dv.precio) AS total_generado
      FROM detalle_venta dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      GROUP BY dv.id_producto
      ORDER BY veces_vendido DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error top productos' });
  }
};
