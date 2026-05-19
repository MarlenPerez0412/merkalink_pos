import { apiRequest } from './apiClient';

export const getAlertas = () => apiRequest('/alertas');

export const updateAlertaEstado = (id, estado) =>
  apiRequest(`/alertas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado }),
  });
