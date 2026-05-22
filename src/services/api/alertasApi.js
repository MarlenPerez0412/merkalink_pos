import { apiRequest } from './apiClient';

export const getAlertas = () => apiRequest('/alertas');

export const updateEstadoAlerta = (id, estado = 'Vista') =>
  apiRequest(`/alertas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado }),
  });

export const generarAlertas = () =>
  apiRequest('/alertas/generar', {
    method: 'POST',
  });