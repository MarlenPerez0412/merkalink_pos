import { apiRequest } from './apiClient';

export const getUsuarios = () => apiRequest('/auth/usuarios');

export const createUsuario = (usuario) =>
  apiRequest('/auth/usuarios', {
    method: 'POST',
    body: JSON.stringify(usuario),
  });

export const updateUsuario = (id, usuario) =>
  apiRequest(`/auth/usuarios/${id}/admin`, {
    method: 'PUT',
    body: JSON.stringify(usuario),
  });

export const deleteUsuario = (id) =>
  apiRequest(`/auth/usuarios/${id}`, {
    method: 'DELETE',
  });
