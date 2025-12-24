import api from './api';

/**
 * Total vendido en un mes
 * @param {number} mes 
 * @param {number} anio 
 */
export const totalVendidoMes = async (mes, anio) => {
  const { data } = await api.get(`/reportes/ventas-mes`, {
    params: { mes, anio },
  });
  return data;
};

/**
 * Ventas por usuario
 */
export const ventasPorUsuario = async () => {
  const { data } = await api.get('/reportes/ventas-usuario');
  return data;
};

/**
 * Ventas por método de pago
 */
export const ventasPorMetodoPago = async () => {
  const { data } = await api.get('/reportes/ventas-metodo');
  return data;
};

/**
 * Productos con stock disponible
 */
export const productosEnStock = async () => {
  const { data } = await api.get('/reportes/stock');
  return data;
};

/**
 * Top productos más vendidos
 */
export const topProductosVendidos = async () => {
  const { data } = await api.get('/reportes/top-productos');
  return data;
};
