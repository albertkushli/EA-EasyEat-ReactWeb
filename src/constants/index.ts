// ============================================
// CONSTANTES DE LA APLICACIÓN
// ============================================

// ─────────────────────────────────────────
// PAGINACIÓN
// ─────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const VISITS_LIMIT = 1000;
export const VISITS_PAGE_SIZE = 200;

export const DEFAULT_META = {
  total: 0,
  page: 1,
  limit: 1,
  totalPages: 1,
};

// ─────────────────────────────────────────
// ROLES DE USUARIO
// ─────────────────────────────────────────

export const USER_ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'owner',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

// ─────────────────────────────────────────
// LOCAL STORAGE KEYS
// ─────────────────────────────────────────

export const STORAGE_KEYS = {
  AUTH_DATA: 'auth_data',
  RESTAURANT_DATA: 'restaurant_data',
} as const;

// ─────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',

  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,

  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEES_BY_RESTAURANT: (restaurantId: string) =>
    `/employees/restaurant/${restaurantId}`,
  EMPLOYEES_WITH_STATS: (restaurantId: string) =>
    `/employees/restaurant/${restaurantId}/stats`,

  // Restaurants
  RESTAURANTS: '/restaurants',
  RESTAURANT_BY_ID: (id: string) => `/restaurants/${id}`,
  RESTAURANT_FULL: (id: string) => `/restaurants/${id}/full`,
  RESTAURANT_VISITS: (id: string) => `/restaurants/${id}/visits`,

  // Statistics
  STATISTICS: '/statistics',
  RESTAURANT_STATISTICS: (restaurantId: string) =>
    `/statistics/restaurant/${restaurantId}`,

  // Visits
  VISITS: '/visits',
  VISITS_BY_RESTAURANT: (restaurantId: string) =>
    `/restaurants/${restaurantId}/visits`,

  // Reviews
  REVIEWS: '/reviews',
  REVIEWS_BY_RESTAURANT: (restaurantId: string) =>
    `/restaurants/${restaurantId}/reviews`,
} as const;
