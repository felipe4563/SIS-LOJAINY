import api from './api';

export const obtenerPerfil    = ()     => api.get('/perfil').then(r => r.data);
export const actualizarPerfil = (data) => api.put('/perfil', data).then(r => r.data);
export const cambiarPassword  = (data) => api.put('/perfil/password', data).then(r => r.data);
