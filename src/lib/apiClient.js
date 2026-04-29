import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────
// Obtener token del localStorage
// ─────────────────────────────────────────
export function getStoredAuthToken() {
  try {
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;

    const stored = localStorage.getItem('auth_data');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed?.accessToken ?? parsed?.token ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────
// Crear instancia axios
// ─────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // IMPORTANTE para cookies
});

// ─────────────────────────────────────────
// INTERCEPTOR REQUEST
// ─────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

// ─────────────────────────────────────────
// INTERCEPTOR RESPONSE
// ─────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Allow callers to suppress logging by adding header 'X-Suppress-Error-Log'
    const suppress = error.config?.headers?.['X-Suppress-Error-Log'] || error.config?.headers?.['x-suppress-error-log'];
    if (!suppress) {
      console.error('❌ API ERROR:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data,
      });
    }

    // Si token inválido → limpiar sesión
    if (error.response?.status === 401) {
      console.warn('⚠️ Token inválido o expirado → limpiando sesión');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_data');
      localStorage.removeItem('restaurant_data');

      // opcional: redirigir al login
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;