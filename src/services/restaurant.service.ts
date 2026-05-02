// ============================================
// SERVICIO DE RESTAURANTES
// ============================================

import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../constants';
import { IRestaurant, IRestaurantStats, IVisit, IPaginatedResponse } from '../types';
import { parsePaginatedResponse, sortByDateDesc, extractArray } from '../utils/response-parser';

/**
 * Obtiene restaurante completo por ID
 */
export async function fetchRestaurantFull(restaurantId: string): Promise<IRestaurant | null> {
  try {
    const res = await apiClient.get<IRestaurant>(
      API_ENDPOINTS.RESTAURANT_FULL(restaurantId)
    );
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
      API_ENDPOINTS.RESTAURANT_STATISTICS(restaurantId)
    );

    // Soporta distintos formatos de respuesta
    if (res.data?.data && typeof res.data.data === 'object') return res.data.data;
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
  limit: number = 1000
): Promise<IPaginatedResponse<IVisit>> {
  try {
    const res = await apiClient.get(
      API_ENDPOINTS.RESTAURANT_VISITS(restaurantId),
      { params: { page, limit } }
    );

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
  pageSize: number = 200
): Promise<IVisit[]> {
  if (!restaurantId) return [];

  try {
    const firstResponse = await apiClient.get(
      API_ENDPOINTS.RESTAURANT_VISITS(restaurantId),
      { params: { page: 1, limit: pageSize } }
    );

    const firstPage = parsePaginatedResponse<IVisit>(firstResponse.data, pageSize);
    const allVisits = [...firstPage.data];

    // Recorre todas las páginas
    for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
      const response = await apiClient.get(
        API_ENDPOINTS.RESTAURANT_VISITS(restaurantId),
        { params: { page, limit: pageSize } }
      );

      const parsedPage = parsePaginatedResponse<IVisit>(response.data, pageSize);
      allVisits.push(...parsedPage.data);
    }

    return sortByDateDesc(allVisits);
  } catch (err) {
    console.error('Error fetching all restaurant visits:', err);
    return [];
  }
}

export const restaurantService = {
  fetchRestaurantFull,
  fetchRestaurantStats,
  fetchRestaurantVisits,
  fetchAllRestaurantVisits,
};
