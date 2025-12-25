import api from './api';

export const obtenerReporteVentas = (filtros) => {
  return api.get('/reportes/ventas', { params: filtros });
};
