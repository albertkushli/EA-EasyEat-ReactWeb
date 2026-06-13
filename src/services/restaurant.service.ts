// ============================================
// SERVICIO DE RESTAURANTES
// ============================================

import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';
import { IRestaurant, IRestaurantStats, IVisit, IPaginatedResponse } from '@/types';
import type { Restaurant } from '@/types/Restaurant';
import { extractArray, parsePaginatedResponse, sortByDateDesc } from '@/utils/response-parser';

function normalizeRestaurantLocation(
  rawLocation: any,
  rawRestaurant: any,
): Restaurant['profile']['location'] {
  const latitude =
    rawLocation?.latitude ??
    rawLocation?.lat ??
    rawRestaurant?.location?.latitude ??
    rawRestaurant?.location?.lat;
  const longitude =
    rawLocation?.longitude ??
    rawLocation?.lng ??
    rawLocation?.lon ??
    rawRestaurant?.location?.longitude ??
    rawRestaurant?.location?.lng ??
    rawRestaurant?.location?.lon;

  return {
    city: rawLocation?.city ?? rawRestaurant?.profile?.location?.city ?? '',
    address: rawLocation?.address ?? rawRestaurant?.profile?.location?.address,
    googlePlaceId: rawLocation?.googlePlaceId ?? rawRestaurant?.profile?.location?.googlePlaceId,
    coordinates: Array.isArray(rawLocation?.coordinates?.coordinates)
      ? rawLocation.coordinates
      : {
          type: 'Point',
          coordinates: [
            Number.isFinite(Number(longitude)) ? Number(longitude) : 0,
            Number.isFinite(Number(latitude)) ? Number(latitude) : 0,
          ],
        },
  };
}

function normalizeRestaurant(rawRestaurant: IRestaurant | any): Restaurant {
  const profile = rawRestaurant?.profile ?? {};

  return {
    _id: rawRestaurant?._id ?? rawRestaurant?.id,
    profile: {
      name: profile.name ?? 'Restaurant',
      description: profile.description ?? '',
      globalRating: profile.globalRating ?? 0,
      category: profile.category ?? profile.categories ?? [],
      timetable: profile.timetable,
      image: profile.image ?? profile.images ?? [],
      contact: profile.contact,
      location: normalizeRestaurantLocation(profile.location, rawRestaurant),
    },
    employees: rawRestaurant?.employees,
    dishes: rawRestaurant?.dishes,
    rewards: rawRestaurant?.rewards,
    statistics: rawRestaurant?.statistics,
    badges: rawRestaurant?.badges,
    visits: rawRestaurant?.visits,
    reviews: rawRestaurant?.reviews,
    deletedAt: rawRestaurant?.deletedAt,
    createdAt: rawRestaurant?.createdAt,
    updatedAt: rawRestaurant?.updatedAt,
  };
}

/**
 * Obtiene restaurante completo por ID
 */
export async function fetchRestaurantFull(restaurantId: string): Promise<IRestaurant | null> {
  try {
    const res = await apiClient.get<IRestaurant>(API_ENDPOINTS.RESTAURANT_FULL(restaurantId));
    return res.data ?? null;
  } catch (err) {
    console.error('Error fetching full restaurant:', err);
    return null;
  }
}

/**
 * Obtiene estadísticas del restaurante
 */
export async function fetchRestaurantStats(restaurantId: string): Promise<IRestaurantStats | null> {
  try {
    const res = await apiClient.get<IRestaurantStats>(
      API_ENDPOINTS.RESTAURANT_STATISTICS(restaurantId),
    );

    // Soporta distintos formatos de respuesta
    const resData = res.data as any;
    if (resData?.data && typeof resData.data === 'object') return resData.data;
    if (res.data && typeof res.data === 'object') return res.data;
    return null;
  } catch (err) {
    console.error('Error fetching restaurant stats:', err);
    return null;
  }
}

/**
 * Obtiene visitas paginadas del restaurante
 */
export async function fetchRestaurantVisits(
  restaurantId: string,
  page: number = 1,
  limit: number = 1000,
): Promise<IPaginatedResponse<IVisit>> {
  try {
    const res = await apiClient.get(API_ENDPOINTS.RESTAURANT_VISITS(restaurantId), {
      params: { page, limit },
    });

    const parsed = parsePaginatedResponse<IVisit>(res.data, limit);

    // Ordena visitas por fecha descendente
    return {
      ...parsed,
      data: sortByDateDesc(parsed.data),
    };
  } catch (err) {
    console.error('Error fetching restaurant visits:', err);
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      },
    };
  }
}

/**
 * Obtiene TODAS las visitas del restaurante (recorre todas las páginas)
 * Se usa para gráficos y análisis de tendencias
 */
export async function fetchAllRestaurantVisits(
  restaurantId: string,
  pageSize: number = 200,
): Promise<IVisit[]> {
  if (!restaurantId) return [];

  try {
    const firstResponse = await apiClient.get(API_ENDPOINTS.RESTAURANT_VISITS(restaurantId), {
      params: { page: 1, limit: pageSize },
    });

    const firstPage = parsePaginatedResponse<IVisit>(firstResponse.data, pageSize);
    const allVisits = [...firstPage.data];

    // Recorre todas las páginas
    for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
      const response = await apiClient.get(API_ENDPOINTS.RESTAURANT_VISITS(restaurantId), {
        params: { page, limit: pageSize },
      });

      const parsedPage = parsePaginatedResponse<IVisit>(response.data, pageSize);
      allVisits.push(...parsedPage.data);
    }

    return sortByDateDesc(allVisits);
  } catch (err) {
    console.error('Error fetching all restaurant visits:', err);
    return [];
  }
}

export const updateRestaurant = async (restaurantId: string, restaurantData: any) => {
  try {
    const response = await apiClient.put(`/restaurants/${restaurantId}`, restaurantData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
};

export const getRestaurant = async (restaurantId: string) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
};

/**
 * Soft-deletes a restaurant
 */
export async function softDeleteRestaurant(restaurantId: string): Promise<boolean> {
  try {
    await apiClient.delete(`/restaurants/${restaurantId}/soft`);
    return true;
  } catch (err) {
    console.error('Error soft-deleting restaurant:', err);
    return false;
  }
}

/**
 * Obtiene lista de restaurantes (con paginación opcional)
 */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const res = await apiClient.get(API_ENDPOINTS.RESTAURANTS);

    // Soporta tanto respuestas tipo array como { data: [...] }
    return extractArray<IRestaurant>(res.data).map(normalizeRestaurant);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    return [];
  }
}

/**
 * Obtiene restaurantes cercanos a una ubicación
 */
export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  maxDistance: number = 5000,
): Promise<Restaurant[]> {
  try {
    const res = await apiClient.get(API_ENDPOINTS.RESTAURANTS_NEAR_BY(lng, lat, maxDistance));

    const data = res.data?.data || res.data || [];
    return Array.isArray(data) ? data.map(normalizeRestaurant) : [];
  } catch (err) {
    console.error('Error fetching nearby restaurants:', err);
    return [];
  }
}

export const restaurantService = {
  fetchRestaurantFull,
  fetchRestaurantStats,
  fetchRestaurantVisits,
  fetchAllRestaurantVisits,
  updateRestaurant,
  getRestaurant,
  softDeleteRestaurant,
};
