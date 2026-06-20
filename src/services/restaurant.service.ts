// ============================================
// SERVICIO DE RESTAURANTES
// ============================================

import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';
import { IRestaurant, IRestaurantStats, IVisit, IPaginatedResponse } from '@/types';
import type { Restaurant } from '@/types/Restaurant';
import { extractArray, parsePaginatedResponse, sortByDateDesc } from '@/utils/response-parser';

function normalizeRestaurantLocation(
  rawLocation: unknown,
  rawRestaurant: unknown,
): Restaurant['profile']['location'] {
  const loc = rawLocation as Record<string, unknown> | undefined;
  const rest = rawRestaurant as Record<string, unknown> | undefined;
  const restProfile = rest?.profile as Record<string, unknown> | undefined;
  const restLoc = rest?.location as Record<string, unknown> | undefined;
  const profileLoc = restProfile?.location as Record<string, unknown> | undefined;

  const latitude = loc?.latitude ?? loc?.lat ?? restLoc?.latitude ?? restLoc?.lat;
  const longitude =
    loc?.longitude ?? loc?.lng ?? loc?.lon ?? restLoc?.longitude ?? restLoc?.lng ?? restLoc?.lon;

  const locCoords = loc?.coordinates as Record<string, unknown> | undefined;

  return {
    city: (loc?.city as string) ?? (profileLoc?.city as string) ?? '',
    address: (loc?.address as string) ?? (profileLoc?.address as string),
    googlePlaceId: (loc?.googlePlaceId as string) ?? (profileLoc?.googlePlaceId as string),
    coordinates: Array.isArray(locCoords?.coordinates)
      ? (loc?.coordinates as Restaurant['profile']['location']['coordinates'])
      : {
          type: 'Point',
          coordinates: [
            Number.isFinite(Number(longitude)) ? Number(longitude) : 0,
            Number.isFinite(Number(latitude)) ? Number(latitude) : 0,
          ],
        },
  };
}

function normalizeRestaurant(rawRestaurant: unknown): Restaurant {
  const r = rawRestaurant as Record<string, unknown> | undefined;
  const profile = (r?.profile as Record<string, unknown>) ?? {};

  return {
    _id: (r?._id as string) ?? (r?.id as string),
    profile: {
      name: (profile.name as string) ?? 'Restaurant',
      description: (profile.description as string) ?? '',
      globalRating: (profile.globalRating as number) ?? 0,
      category:
        ((profile.category ?? profile.categories) as Restaurant['profile']['category']) ?? [],
      timetable: profile.timetable as Restaurant['profile']['timetable'],
      image: ((profile.image ?? profile.images) as string[]) ?? [],
      contact: profile.contact as Restaurant['profile']['contact'],
      location: normalizeRestaurantLocation(profile.location, rawRestaurant),
    },
    employees: r?.employees as string[],
    dishes: r?.dishes as string[],
    rewards: r?.rewards as string[],
    statistics: r?.statistics as string | null,
    badges: r?.badges as string[],
    visits: r?.visits as string[],
    reviews: r?.reviews as string[],
    deletedAt: r?.deletedAt as string | null,
    createdAt: r?.createdAt as string,
    updatedAt: r?.updatedAt as string,
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
    const resData = res.data as unknown as Record<string, unknown>;
    if (resData?.data && typeof resData.data === 'object') return resData.data as IRestaurantStats;
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

export const updateRestaurant = async (
  restaurantId: string,
  restaurantData: Partial<Restaurant>,
) => {
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

export async function fetchRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
  if (!ownerId) return [];

  try {
    const res = await apiClient.get(API_ENDPOINTS.RESTAURANTS, {
      params: { owner_id: ownerId },
    });

    return extractArray<IRestaurant>(res.data).map(normalizeRestaurant);
  } catch (err) {
    console.error('Error fetching owner restaurants:', err);
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
  fetchRestaurantsByOwner,
  updateRestaurant,
  getRestaurant,
  softDeleteRestaurant,
};
