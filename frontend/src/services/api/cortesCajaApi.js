import { apiRequest } from './apiClient';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getCortesCaja = (params = {}) => apiRequest(`/cortes-caja${buildQuery(params)}`);

export const createCorteCaja = (corte) =>
  apiRequest('/cortes-caja', {
    method: 'POST',
    body: JSON.stringify(corte),
  });

export const getCorteCaja = (id, params = {}) => apiRequest(`/cortes-caja/${id}${buildQuery(params)}`);

export const getCorteCajaPdfData = (id) => apiRequest(`/cortes-caja/${id}/pdf-data`);

export const getCorteCajaReporte = (id, params = {}) => apiRequest(`/cortes-caja/${id}/reporte${buildQuery(params)}`);

export const deleteCorteCaja = (id) =>
  apiRequest(`/cortes-caja/${id}`, {
    method: 'DELETE',
  });
