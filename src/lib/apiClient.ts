import axios, { AxiosInstance } from 'axios';
import { STORAGE_KEYS } from '../constants';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────
// Obtener token del localStorage
// ─────────────────────────────────────────
export function getStoredAuthToken(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed?.accessToken ?? null;
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
    console.error('❌ API ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data,
    });

    // Si token inválido → limpiar sesión
    if (error.response?.status === 401) {
      console.warn('⚠️ Token inválido o expirado → limpiando sesión');

      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      localStorage.removeItem(STORAGE_KEYS.RESTAURANT_DATA);

      // opcional: redirigir al login
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;