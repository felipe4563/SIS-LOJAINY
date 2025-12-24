import db from "../config/db.js";

/**
 * Dashboard avanzado con datos para gráficas
 */
export const obtenerDashboardAvanzado = async (req, res) => {
  try {
    // 1️⃣ Ventas por día (últimos 7 días)
    const [ventasPorDia] = await db.query(`
      SELECT DATE(fecha) AS dia, COUNT(*) AS total_ventas, SUM(total) AS monto_total
      FROM ventas
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha)
      ORDER BY dia ASC
    `);

    // 2️⃣ Productos más vendidos (top 5)
    const [productosMasVendidos] = await db.query(`
      SELECT p.descripcion AS producto, COUNT(dv.id_producto) AS cantidad_vendida
      FROM detalle_venta dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      GROUP BY dv.id_producto
      ORDER BY cantidad_vendida DESC
      LIMIT 5
    `);

    // 3️⃣ Ventas por método de pago
    const [ventasPorMetodo] = await db.query(`
      SELECT metodo_pago, COUNT(*) AS cantidad, SUM(total) AS monto
      FROM ventas
      GROUP BY metodo_pago
    `);

    // 4️⃣ Productos con stock bajo (menos de 5)
    const [stockBajo] = await db.query(`
      SELECT descripcion AS producto, stock
      FROM productos
      WHERE stock <= 5
      ORDER BY stock ASC
    `);

    // 5️⃣ Total general
    const [totales] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM ventas) AS total_ventas,
        (SELECT IFNULL(SUM(total), 0) FROM ventas) AS monto_total,
        (SELECT COUNT(*) FROM usuarios WHERE activo = 1) AS total_usuarios,
        (SELECT COUNT(*) FROM productos) AS total_productos,
        (SELECT SUM(stock) FROM productos) AS stock_total
    `);

    res.json({
      totales: totales[0],
      ventasPorDia,
      productosMasVendidos,
      ventasPorMetodo,
      stockBajo
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener datos del dashboard avanzado" });
  }
};
