// ============================================
// TIPOS PRINCIPALES DE LA APLICACIÓN
// ============================================

// ─────────────────────────────────────────
// USUARIO / AUTENTICACIÓN
// ─────────────────────────────────────────

export type UserRole = 'customer' | 'owner' | 'staff' | 'admin';

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  restaurant_id?: string;
  isActive?: boolean;
  deletedAt?: Date | null;
  profilePictures?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomer extends IUser {
  pointsWallet?: string[];
  visitHistory?: string[];
  favoriteRestaurants?: string[];
  badges?: string[];
  reviews?: string[];
}

export interface IEmployee extends IUser {
  restaurant_id: string;
}

export interface IAuthResponse {
  accessToken: string;
  customer?: ICustomer;
  employee?: IEmployee;
  admin?: IUser;
}

export interface IAuthState {
  accessToken: string;
  user: IUser;
}

// ─────────────────────────────────────────
// RESTAURANTE
// ─────────────────────────────────────────

export interface IRestaurantLocation {
  address: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface IRestaurantProfile {
  name: string;
  description?: string;
  location: IRestaurantLocation;
  phone?: string;
  email?: string;
  globalRating?: number;
  images?: string[];
}

export interface IRestaurant {
  _id?: string;
  id?: string;
  profile: IRestaurantProfile;
  owner_id: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─────────────────────────────────────────
// VISITAS
// ─────────────────────────────────────────

export interface IVisit {
  _id?: string;
  id?: string;
  restaurant_id: string;
  customer_id: string;
  date: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
  points?: number;
  duration?: number;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

// ─────────────────────────────────────────
// RESEÑAS
// ─────────────────────────────────────────

export interface IReview {
  _id?: string;
  id?: string;
  restaurant_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─────────────────────────────────────────
// EMPLEADO
// ─────────────────────────────────────────

export interface IEmployeeStats {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: UserRole;
  totalServed?: number;
  averageRating?: number;
  createdAt?: Date;
}

// ─────────────────────────────────────────
// ESTADÍSTICAS / KPIs
// ─────────────────────────────────────────

export interface IRestaurantStats {
  restaurant_id: {
    _id?: string;
    id?: string;
  } | string;
  loyalCustomers?: number;
  averagePointsPerVisit?: number;
  averageRating?: number;
  totalVisits?: number;
  totalRevenue?: number;
  peakHours?: Record<string, number>;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─────────────────────────────────────────
// API RESPONSE GENÉRICO
// ─────────────────────────────────────────

export interface IApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
  error?: string;
}
