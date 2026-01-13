import db from '../config/db.js';

export const reporteVentas = async (req, res) => {
  try {
    const {
      metodo_pago = null,
      id_usuario = null,
      fecha_inicio,
      fecha_fin
    } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        message: 'fecha_inicio y fecha_fin son obligatorios'
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        v.id_venta,
        v.fecha,
        v.metodo_pago,
        v.total,
        CONCAT(u.nombre, ' ', u.apellido) AS vendedor,

        GROUP_CONCAT(
          CONCAT(
            p.id_producto, '|',
            REPLACE(p.descripcion, '|', ''), '|',
            dv.precio, '|',
            dv.cantidad
          )
          SEPARATOR ';;'
        ) AS productos

      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      INNER JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      WHERE
        (? IS NULL OR v.metodo_pago = ?)
      AND
        (? IS NULL OR v.id_usuario = ?)
      AND
        DATE(v.fecha) BETWEEN ? AND ?
      GROUP BY
        v.id_venta,
        v.fecha,
        v.metodo_pago,
        v.total,
        u.nombre,
        u.apellido
      ORDER BY v.fecha DESC
      `,
      [
        metodo_pago, metodo_pago,
        id_usuario, id_usuario,
        fecha_inicio, fecha_fin
      ]
    );

    // 🧠 Convertir productos a JSON real
    const data = rows.map(v => ({
      ...v,
      productos: v.productos
        ? v.productos.split(';;').map(item => {
            const [id_producto, producto, precio, cantidad] = item.split('|');
            return {
              id_producto: Number(id_producto),
              producto,
              precio: Number(precio),
              cantidad: Number(cantidad)
            };
          })
        : []
    }));

    res.json(data);

  } catch (error) {
    console.error('Error reporteVentas:', error);
    res.status(500).json({
      message: 'Error al generar reporte de ventas'
    });
  }
};
