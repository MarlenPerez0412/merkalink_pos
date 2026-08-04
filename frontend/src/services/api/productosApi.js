import { apiFormRequest, apiRequest } from './apiClient';

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const getProductos = (params = {}) => apiRequest(`/productos${buildQuery(params)}`);

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
  return apiFormRequest('/productos/upload-imagen', formData);
};
