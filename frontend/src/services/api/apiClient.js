const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const TOKEN_STORAGE_KEY = 'token';

export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  window.dispatchEvent(new Event('authUnauthorized'));
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseErrorBody = async (response) => response.json().catch(() => ({}));

const handleErrorResponse = async (response) => {
  const errorBody = await parseErrorBody(response);

  if (response.status === 401) {
    clearAuthSession();
    throw new Error(errorBody.message || errorBody.mensaje || 'Tu sesion expiro o no es valida. Inicia sesion nuevamente.');
  }

  throw new Error(errorBody.message || errorBody.mensaje || `Error HTTP ${response.status}`);
};

export const apiRequest = async (path, options = {}) => {
  const { headers = {}, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  if (response.status === 204) return null;

  return response.json();
};

export const apiFormRequest = async (path, formData, options = {}) => {
  const { headers = {}, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    method: fetchOptions.method || 'POST',
    cache: 'no-store',
    headers: {
      ...headers,
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  if (response.status === 204) return null;

  return response.json();
};
