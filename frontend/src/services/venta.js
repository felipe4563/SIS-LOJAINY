import api from "./api";

// ==========================
// LISTAR VENTAS
// ==========================
export const listarVentas = async () => {
  const { data } = await api.get("/venta");
  return data;
};

// ==========================
// OBTENER VENTA
// ==========================
export const obtenerVenta = async (id) => {
  const { data } = await api.get(`/venta/${id}`);
  return data;
};

// ==========================
// CREAR VENTA
// detalles: [{id_producto, precio}, ...]
export const crearVenta = async ({ metodo_pago, total, detalles, cliente }) => {
  const { data } = await api.post("/venta", { metodo_pago, total, detalles, cliente });
  return data;
};

// ==========================
// ELIMINAR VENTA
// ==========================
export const eliminarVenta = async (id) => {
  const { data } = await api.delete(`/venta/${id}`);
  return data;
};
