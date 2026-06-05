const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || errorBody.mensaje || `Error HTTP ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json();
};
