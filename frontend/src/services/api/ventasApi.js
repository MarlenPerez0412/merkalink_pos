import { apiRequest } from './apiClient';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getVentas = (params = {}) => apiRequest(`/ventas${buildQuery(params)}`);

export const getVentaDetalle = (id) => apiRequest(`/ventas/${id}`);

export const createVenta = (venta) =>
  apiRequest('/ventas', {
    method: 'POST',
    body: JSON.stringify(venta),
  });

export const createVentaPos = (venta) =>
  apiRequest('/ventas/pos', {
    method: 'POST',
    body: JSON.stringify(venta),
  });
