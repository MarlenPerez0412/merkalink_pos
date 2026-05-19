import { apiRequest } from './apiClient';

export const getProductos = () => apiRequest('/productos');

export const createProducto = (producto) =>
  apiRequest('/productos', {
    method: 'POST',
    body: JSON.stringify(producto),
  });

export const updateProducto = (id, producto) =>
  apiRequest(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto),
  });

export const deleteProducto = (id) =>
  apiRequest(`/productos/${id}`, {
    method: 'DELETE',
  });
