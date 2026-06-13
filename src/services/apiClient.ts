import axios, { AxiosInstance } from 'axios';
import { STORAGE_KEYS } from '../constants';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────
// Obtener token del localStorage
// ─────────────────────────────────────────
export function getStoredAuthToken(): string | null {
  try {
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;

    const stored = localStorage.getItem('auth_data');
    const legacyStored = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
    const authBlob = stored ?? legacyStored;

    if (!authBlob) return null;

    const parsed = JSON.parse(authBlob);
    return parsed?.accessToken ?? parsed?.token ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────
// Crear instancia axios
// ─────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // IMPORTANTE para cookies
});

// ─────────────────────────────────────────
// INTERCEPTOR REQUEST
// ─────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();

  if (token && config.headers && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
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
    const suppress =
      error.config?.headers?.['X-Suppress-Error-Log'] ||
      error.config?.headers?.['x-suppress-error-log'];
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

      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      localStorage.removeItem(STORAGE_KEYS.RESTAURANT_DATA);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_data');
      localStorage.removeItem('restaurant_data');

      // opcional: redirigir al login
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default apiClient;
