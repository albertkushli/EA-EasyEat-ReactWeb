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
  googleId?: string;
  authProvider?: 'local' | 'google';
  avatar?: string;
}

export interface ICustomer extends IUser {
  pointsWallet?: string[];
  visitHistory?: string[];
  favoriteRestaurants?: string[];
  badges?: string[];
  reviews?: string[];
}

export interface IEmployee {
  _id?: string;
  restaurant_id: string;
  profile: {
    name: string;
    password?: string;
    email?: string;
    phone?: string;
    role?: string;
    googleId?: string;
    authProvider?: 'local' | 'google';
    avatar?: string;
  };
  isActive: boolean;
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

export interface IRestaurantContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface IRestaurantProfile {
  name: string;
  description?: string;
  location: IRestaurantLocation;
  contact?: IRestaurantContact;
  globalRating?: number;
  images?: string[];
}

export interface IRestaurant {
  _id?: string;
  id?: string;
  profile: IRestaurantProfile;
  owner_id: string;
  isActive?: boolean;
  plan?: 'free' | 'premium' | 'business';
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
  employee_id?: string;
  date: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
  pointsEarned?: number;
  billAmount?: number;
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

export interface IReviewRatings {
  foodQuality?: number;
  staffService?: number;
  cleanliness?: number;
  environment?: number;
}

export interface IReview {
  _id?: string;
  id?: string;
  employee_id?: string | null;
  customer_id: string | any;
  restaurant_id: string | any;
  date?: string | Date;
  globalRating: number;
  images?: string[];
  ratings?: IReviewRatings;
  comment?: string;
  likes?: number;
  deleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  restaurant_id:
    | {
        _id?: string;
        id?: string;
      }
    | string;
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
