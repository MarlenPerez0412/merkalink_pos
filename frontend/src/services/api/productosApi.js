import { apiRequest } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getProductos = () => apiRequest('/productos');

export const getCategorias = () => apiRequest('/productos/categorias');

export const createCategoria = (categoria) =>
  apiRequest('/productos/categorias', {
    method: 'POST',
    body: JSON.stringify(categoria),
  });

export const updateCategoria = (id, categoria) =>
  apiRequest(`/productos/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoria),
  });

export const deleteCategoria = (id) =>
  apiRequest(`/productos/categorias/${id}`, {
    method: 'DELETE',
  });

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

export const uploadProductoImagen = async (file) => {
  const formData = new FormData();
  formData.append('imagen', file);

  const response = await fetch(`${API_BASE_URL}/productos/upload-imagen`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.mensaje || `Error HTTP ${response.status}`);
  }

  return response.json();
};
