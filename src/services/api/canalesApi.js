import { apiRequest } from './apiClient';

export const getCanales = () => apiRequest('/canales');
