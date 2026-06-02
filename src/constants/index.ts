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
  CUSTOMER_FULL: (id: string) => `/customers/${id}/full`,

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
  RESTAURANTS_NEAR_BY: (lng: number, lat: number, maxDistance: number = 5000) =>
    `/restaurants/near-by?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`,

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

  // Reports
  REPORTS: '/reports',
  REPORT_BY_ID: (reportId: string) => `/reports/${reportId}`,
  RESTAURANT_REPORT: (restaurantId: string) => `/restaurants/${restaurantId}/report`,

  // Reward Redemptions
  REWARD_REDEMPTIONS: '/rewardRedemptions',
  REWARD_REDEMPTIONS_BY_RESTAURANT: (restaurantId: string) =>
    `/rewardRedemptions/restaurant/${restaurantId}`,
} as const;
