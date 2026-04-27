// src/services/rol.js
import api from '../services/api'; // tu instancia de axios ya configurada

/**
 * Listar todos los roles
 */
export const listarRoles = async () => {
  const { data } = await api.get('/roles');
  return data;
};

/**
 * Obtener un rol por ID con sus permisos
 */
export const obtenerRol = async (id) => {
  const { data } = await api.get(`/roles/${id}`);
  return data;
};

/**
 * Crear un rol con permisos
 * @param {Object} rol { nombre: string, permisos: array de id_permiso }
 */
export const crearRol = async (rol) => {
  const { data } = await api.post('/roles', rol);
  return data;
};

/**
 * Actualizar un rol y sus permisos
 * @param {number} id 
 * @param {Object} rol { nombre: string, permisos: array de id_permiso }
 */
export const actualizarRol = async (id, rol) => {
  const { data } = await api.put(`/roles/${id}`, rol);
  return data;
};

/**
 * Eliminar un rol
 * @param {number} id 
 */
export const eliminarRol = async (id) => {
  const { data } = await api.delete(`/roles/${id}`);
  return data;
};

/**
 * Listar todos los permisos
 */
export const listarPermisos = async () => {
  const { data } = await api.get('/roles/permisos');
  return data;
};
