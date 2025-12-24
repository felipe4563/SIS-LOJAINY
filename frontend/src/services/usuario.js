import api from './api';

// Listar usuarios
export const obtenerUsuarios = () =>
  api.get('/usuarios');

// Crear usuario
export const crearUsuario = (data) =>
  api.post('/usuarios', data);

// Actualizar usuario
export const actualizarUsuario = (id, data) =>
  api.put(`/usuarios/${id}`, data);

// Activar / desactivar usuario
export const cambiarEstadoUsuario = (id) =>
  api.patch(`/usuarios/${id}/estado`);
