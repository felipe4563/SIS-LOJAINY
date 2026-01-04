import axios from "../services/api"; // axios con token

// ==========================
// CATEGORÍAS
// ==========================

export const listarCategorias = async () => {
  const { data } = await axios.get("/atributos/categorias");
  return data;
};

export const obtenerCategoria = async (id) => {
  const { data } = await axios.get(`/atributos/categorias/${id}`);
  return data;
};

export const crearCategoria = async (payload) => {
  const { data } = await axios.post("/atributos/categorias", payload);
  return data;
};

export const actualizarCategoria = async (id, payload) => {
  const { data } = await axios.put(`/atributos/categorias/${id}`, payload);
  return data;
};

export const eliminarCategoria = async (id) => {
  const { data } = await axios.delete(`/atributos/categorias/${id}`);
  return data;
};

// ==========================
// TALLAS
// ==========================

export const listarTallas = async () => {
  const { data } = await axios.get("/atributos/tallas");
  return data;
};

export const obtenerTalla = async (id) => {
  const { data } = await axios.get(`/atributos/tallas/${id}`);
  return data;
};

export const crearTalla = async (payload) => {
  const { data } = await axios.post("/atributos/tallas", payload);
  return data;
};

export const actualizarTalla = async (id, payload) => {
  const { data } = await axios.put(`/atributos/tallas/${id}`, payload);
  return data;
};

export const eliminarTalla = async (id) => {
  const { data } = await axios.delete(`/atributos/tallas/${id}`);
  return data;
};

// ==========================
// COLORES
// ==========================

export const listarColores = async () => {
  const { data } = await axios.get("/atributos/colores");
  return data;
};

export const obtenerColor = async (id) => {
  const { data } = await axios.get(`/atributos/colores/${id}`);
  return data;
};

export const crearColor = async (payload) => {
  const { data } = await axios.post("/atributos/colores", payload);
  return data;
};

export const actualizarColor = async (id, payload) => {
  const { data } = await axios.put(`/atributos/colores/${id}`, payload);
  return data;
};

export const eliminarColor = async (id) => {
  const { data } = await axios.delete(`/atributos/colores/${id}`);
  return data;
};
// ==========================
// MARCAS
// ==========================

export const listarMarcas = async () => {
  const { data } = await axios.get("/atributos/marcas");
  return data;
};

export const obtenerMarca = async (id) => {
  const { data } = await axios.get(`/atributos/marcas/${id}`);
  return data;
};

export const crearMarca = async (payload) => {
  const { data } = await axios.post("/atributos/marcas", payload);
  return data;
};

export const actualizarMarca = async (id, payload) => {
  const { data } = await axios.put(`/atributos/marcas/${id}`, payload);
  return data;
};

export const eliminarMarca = async (id) => {
  const { data } = await axios.delete(`/atributos/marcas/${id}`);
  return data;
};