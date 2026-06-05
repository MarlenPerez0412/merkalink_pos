import { apiRequest } from './apiClient';

export const getBitacora = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return apiRequest(`/bitacora${query ? `?${query}` : ''}`);
};

export const getBitacoraDetalle = (id) => apiRequest(`/bitacora/${id}`);
