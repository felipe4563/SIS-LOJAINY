import db from "../config/db.js";

/**
 * Reporte de productos vendidos
 * Query params: start, end
 */
export const reporteProductosVendidos = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Debe enviar fecha inicio y fin (start, end)" });
    }

    const fechaInicio = `${start} 00:00:00`;
    const fechaFin = `${end} 23:59:59`;

    const [result] = await db.query(
      `SELECT 
         p.id_producto,
         p.descripcion,
         p.categoria,
         p.color,
         p.talla,
         COUNT(dv.id_detalle) AS cantidad_vendida,
         COALESCE(SUM(dv.precio),0) AS total_vendido
       FROM detalle_venta dv
       INNER JOIN ventas v ON dv.id_venta = v.id_venta
       INNER JOIN productos p ON dv.id_producto = p.id_producto
       WHERE v.fecha BETWEEN ? AND ?
       GROUP BY p.id_producto, p.descripcion, p.categoria, p.color, p.talla
       ORDER BY cantidad_vendida DESC`,
      [fechaInicio, fechaFin]
    );

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar reporte de productos vendidos" });
  }
};



export const reporteStockActual = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT 
         id_producto,
         descripcion,
         categoria,
         color,
         talla,
         stock
       FROM productos
       ORDER BY stock ASC`
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar reporte de stock" });
  }
};