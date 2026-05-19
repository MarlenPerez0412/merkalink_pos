import { apiRequest } from './apiClient';

export const getServicios = () => apiRequest('/servicios');
