import { apiRequest } from './apiClient';

export const getCanales = () => apiRequest('/canales');

export const createCanal = (canal) =>
  apiRequest('/canales', {
    method: 'POST',
    body: JSON.stringify(canal),
  });

export const updateCanal = (id, canal) =>
  apiRequest(`/canales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(canal),
  });

export const deleteCanal = (id) =>
  apiRequest(`/canales/${id}`, {
    method: 'DELETE',
  });

export const deactivateCanal = (id) =>
  apiRequest(`/canales/${id}/desactivar`, {
    method: 'PATCH',
  });
