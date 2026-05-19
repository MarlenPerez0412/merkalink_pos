import { apiRequest } from './apiClient';

export const getVentas = () => apiRequest('/ventas');

export const createVenta = (venta) =>
  apiRequest('/ventas', {
    method: 'POST',
    body: JSON.stringify(venta),
  });
