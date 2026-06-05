import { apiRequest } from './apiClient';

export const getConfiguracion = () => apiRequest('/configuracion');

export const updateConfiguracion = (configuracion) =>
  apiRequest('/configuracion', {
    method: 'PUT',
    body: JSON.stringify(configuracion),
  });
