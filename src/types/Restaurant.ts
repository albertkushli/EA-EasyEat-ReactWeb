export const RESTAURANT_CATEGORIES = [
  'Italià',
  'Japonès',
  'Sushi',
  'Mexicà',
  'Xinès',
  'Indi',
  'Tailandès',
  'Francès',
  'Espanyol',
  'Grec',
  'Turc',
  'Coreà',
  'Vietnamita',
  'Alemany',
  'Brasileny',
  'Peruà',
  'Vegà',
  'Vegetarià',
  'Marisc',
  'Carn',
  'Pizzeria',
  'Cafeteria',
  'Ramen',
  'Gluten Free',
  'Gourmet',
  'Fast Food',
  'Buffet',
  'Food Truck',
  'Lounge',
  'Pub',
  'Wine Bar',
  'Rooftop',
  'Bar',
  'Taperia',
  'Gelateria',
  'Estrella Michelin',
  'Street Food',
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];

export interface TimetableSlot {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

export interface Timetable {
  monday?: TimetableSlot[];
  tuesday?: TimetableSlot[];
  wednesday?: TimetableSlot[];
  thursday?: TimetableSlot[];
  friday?: TimetableSlot[];
  saturday?: TimetableSlot[];
  sunday?: TimetableSlot[];
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface RestaurantLocation {
  city: string;
  address?: string;
  googlePlaceId?: string;
  coordinates: GeoPoint;
}

export interface RestaurantContact {
  phone?: string;
  email?: string;
}

export interface RestaurantProfile {
  name: string;
  description: string;
  globalRating: number; // 0-10
  maxPointsVisit?: number;
  category: RestaurantCategory[];
  timetable?: Timetable;
  image?: string[];
  contact?: RestaurantContact;
  location: RestaurantLocation;
}

export interface Restaurant {
  _id?: string;
  profile: RestaurantProfile;
  employees?: string[]; // ids
  dishes?: string[];
  rewards?: string[];
  statistics?: string | null;
  badges?: string[];
  visits?: string[];
  reviews?: string[];
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  distanceKm?: number;
}

export type RestaurantId = Restaurant['_id'] | string;
