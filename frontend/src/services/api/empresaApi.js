import { apiFormRequest, apiRequest } from './apiClient';

export const getEmpresa = () => apiRequest('/empresa');

export const updateEmpresa = (empresa) =>
  apiRequest('/empresa', {
    method: 'PUT',
    body: JSON.stringify(empresa),
  });

export const uploadLogoEmpresa = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return apiFormRequest('/empresa/logo', formData);
};
