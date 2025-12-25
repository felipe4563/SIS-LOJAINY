import db from '../config/db.js';

export const reporteVentas = async (req, res) => {
  try {
    const {
      metodo_pago = null,
      id_usuario = null,
      fecha_inicio,
      fecha_fin
    } = req.query;

    const [rows] = await db.query(
      `
      SELECT
        v.id_venta,
        v.fecha,
        v.metodo_pago,
        v.total,
        CONCAT(u.nombre, ' ', u.apellido) AS vendedor,
        p.descripcion AS producto,
        dv.precio
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      INNER JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      WHERE
        (? IS NULL OR v.metodo_pago = ?)
      AND
        (? IS NULL OR v.id_usuario = ?)
      AND
        (DATE(v.fecha) BETWEEN ? AND ?)
      ORDER BY v.fecha DESC
      `,
      [
        metodo_pago, metodo_pago,
        id_usuario, id_usuario,
        fecha_inicio, fecha_fin
      ]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};
