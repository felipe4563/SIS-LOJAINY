// controllers/dashboard.controller.js
import db from "../config/db.js";

/**
 * Ventas por mes o por rango de fechas
 * query: ?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
 */
export const ventasPorRango = async (req, res) => {
  try {
    const { fecha_inicio = null, fecha_fin = null } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        DATE(fecha) AS fecha,
        SUM(total) AS total
      FROM ventas
      WHERE
        (? IS NULL OR DATE(fecha) >= ?)
      AND
        (? IS NULL OR DATE(fecha) <= ?)
      GROUP BY fecha
      ORDER BY fecha;
      `,
      [fecha_inicio, fecha_inicio, fecha_fin, fecha_fin]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener ventas por rango de fechas" });
  }
};

/**
 * Ventas por vendedor
 */
export const ventasPorVendedor = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        CONCAT(u.nombre, ' ', u.apellido) AS vendedor,
        SUM(dv.cantidad) AS productos_vendidos,
        SUM(dv.precio * dv.cantidad) AS total_ventas
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      INNER JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      GROUP BY v.id_usuario, u.nombre, u.apellido
      ORDER BY total_ventas DESC;
      `
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener ventas por vendedor" });
  }
};

/**
 * Resumen de inventario - CORREGIDO
 * Ahora incluye productos_diferentes
 */
export const resumenInventario = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        COUNT(*) AS total_productos,
        COUNT(DISTINCT id_producto) AS productos_diferentes,
        SUM(stock) AS cantidad_total,
        SUM(stock * precio) AS valor_total
      FROM productos;
      `
    );

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen de inventario" });
  }
};

/**
 * Productos más vendidos
 */
export const productosMasVendidos = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        c.nombre AS categoria,
        SUM(dv.cantidad) AS cantidad_vendida,
        SUM(dv.precio * dv.cantidad) AS total_vendido
      FROM detalle_venta dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      GROUP BY c.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10;
      `
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos más vendidos por categoría" });
  }
};
