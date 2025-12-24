import axios from "../services/api"; // axios con token

// ==========================
// LISTAR PRODUCTOS
// ==========================
export const listarProductos = async () => {
  const { data } = await axios.get("/productos");
  return data;
};

// ==========================
// OBTENER PRODUCTO
// ==========================
export const obtenerProducto = async (id) => {
  const { data } = await axios.get(`/productos/${id}`);
  return data;
};

// ==========================
// CREAR PRODUCTO
// ==========================
export const crearProducto = async (formData) => {
  const { data } = await axios.post("/productos", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

// ==========================
// ACTUALIZAR PRODUCTO
// ==========================
export const actualizarProducto = async (id, formData) => {
  const { data } = await axios.put(`/productos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

// ==========================
// ELIMINAR PRODUCTO
// ==========================
export const eliminarProducto = async (id) => {
  const { data } = await axios.delete(`/productos/${id}`);
  return data;
};
