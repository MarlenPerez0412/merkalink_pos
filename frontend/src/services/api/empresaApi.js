import { apiRequest } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getEmpresa = () => apiRequest('/empresa');

export const updateEmpresa = (empresa) =>
  apiRequest('/empresa', {
    method: 'PUT',
    body: JSON.stringify(empresa),
  });

export const uploadLogoEmpresa = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/empresa/logo`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.mensaje || errorBody.message || `Error HTTP ${response.status}`);
  }

  return response.json();
};
