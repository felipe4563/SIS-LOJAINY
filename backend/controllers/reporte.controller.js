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

    // 1️⃣ Cabecera de cada venta que cae dentro del filtro
    const [ventas] = await db.query(
      `
      SELECT DISTINCT
        v.id_venta,
        v.fecha,
        v.metodo_pago,
        v.total,
        CONCAT(u.nombre, ' ', u.apellido) AS vendedor
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      INNER JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      WHERE
        (? IS NULL OR v.metodo_pago = ?)
      AND
        (? IS NULL OR v.id_usuario = ?)
      AND
        DATE(v.fecha) BETWEEN ? AND ?
      ORDER BY v.fecha DESC
      `,
      [
        metodo_pago, metodo_pago,
        id_usuario, id_usuario,
        fecha_inicio, fecha_fin
      ]
    );

    // 2️⃣ Líneas de producto de esas ventas, en una sola consulta aparte
    //    (evita empaquetar los datos como texto delimitado, que se rompía
    //    si una descripción contenía '|' o ';;')
    const productosPorVenta = new Map();
    if (ventas.length > 0) {
      const idsVenta = ventas.map(v => v.id_venta);
      const [detalles] = await db.query(
        `
        SELECT
          dv.id_venta,
          p.id_producto,
          p.descripcion AS producto,
          dv.precio,
          dv.cantidad
        FROM detalle_venta dv
        INNER JOIN productos p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta IN (?)
        `,
        [idsVenta]
      );

      for (const d of detalles) {
        if (!productosPorVenta.has(d.id_venta)) productosPorVenta.set(d.id_venta, []);
        productosPorVenta.get(d.id_venta).push({
          id_producto: d.id_producto,
          producto: d.producto,
          precio: Number(d.precio),
          cantidad: Number(d.cantidad)
        });
      }
    }

    const data = ventas.map(v => ({
      ...v,
      productos: productosPorVenta.get(v.id_venta) || []
    }));

    res.json(data);

  } catch (error) {
    console.error('Error reporteVentas:', error);
    res.status(500).json({
      message: 'Error al generar reporte de ventas'
    });
  }
};
