import { apiRequest } from './apiClient';

export const loginUsuario = (credentials) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const updatePerfilUsuario = (id, perfil) =>
  apiRequest(`/auth/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(perfil),
  });

export const cambiarPasswordUsuario = (payload) =>
  apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
