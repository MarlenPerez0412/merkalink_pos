import { apiRequest } from './apiClient';

export const getCategorias = () => apiRequest('/categorias');

export const getCategoriaProductos = (id) => apiRequest(`/categorias/${id}/productos`);

export const createCategoria = (categoria) =>
  apiRequest('/categorias', {
    method: 'POST',
    body: JSON.stringify(categoria),
  });

export const updateCategoria = (id, categoria) =>
  apiRequest(`/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoria),
  });

export const deleteCategoria = (id) =>
  apiRequest(`/categorias/${id}`, {
    method: 'DELETE',
  });
