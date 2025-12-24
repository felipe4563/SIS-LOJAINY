import axios from "../services/api"; // axios con token

// Categorías
export const listarCategorias = async () => {
  const { data } = await axios.get("/atributos/categorias");
  return data;
};

// Tallas
export const listarTallas = async () => {
  const { data } = await axios.get("/atributos/tallas");
  return data;
};

// Colores
export const listarColores = async () => {
  const { data } = await axios.get("/atributos/colores");
  return data;
};
