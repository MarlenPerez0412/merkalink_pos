import { apiRequest } from './apiClient';

export const reservarStockTemporal = ({ token, productoId, cantidad }) =>
  apiRequest('/reservas-stock', {
    method: 'POST',
    body: JSON.stringify({ token, productoId, cantidad }),
  });

export const liberarReservaStock = (token) =>
  apiRequest(`/reservas-stock/${token}`, {
    method: 'DELETE',
  });
