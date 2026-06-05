import { apiRequest } from './apiClient';

export const getProveedores = () => apiRequest('/proveedores');

export const createProveedor = (proveedor) =>
  apiRequest('/proveedores', {
    method: 'POST',
    body: JSON.stringify(proveedor),
  });

export const updateProveedor = (id, proveedor) =>
  apiRequest(`/proveedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proveedor),
  });

export const deleteProveedor = (id) =>
  apiRequest(`/proveedores/${id}`, {
    method: 'DELETE',
  });
