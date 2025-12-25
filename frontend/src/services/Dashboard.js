import api from "./api";

/**
 * Obtener ventas por rango de fechas
 * @param {Object} filtros { fecha_inicio: 'YYYY-MM-DD', fecha_fin: 'YYYY-MM-DD' }
 */
export const obtenerVentasPorRango = (filtros) =>
  api.get("/dashboard/ventas", { params: filtros });

/**
 * Obtener ventas por vendedor
 */
export const obtenerVentasPorVendedor = () =>
  api.get("/dashboard/ventas-vendedor");

/**
 * Obtener productos más vendidos
 */
export const obtenerProductosMasVendidos = () =>
  api.get("/dashboard/productos-mas-vendidos");

/**
 * Obtener resumen de inventario (total productos, valor total)
 */
export const obtenerResumenInventario = () =>
  api.get("/dashboard/resumen-inventario");