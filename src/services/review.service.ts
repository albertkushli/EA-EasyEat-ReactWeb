// ============================================
// SERVICIO DE RESEÑAS
// ============================================

import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../constants';
import { IReview } from '../types';
import { extractArray } from '../utils/response-parser';

/**
 * Obtiene todas las reseñas
 */
export async function fetchAllReviews(): Promise<IReview[]> {
  try {
    const res = await apiClient.get(API_ENDPOINTS.REVIEWS);
    return extractArray<IReview>(res.data);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
}

/**
 * Obtiene reseñas de un restaurante específico
 */
export async function fetchRestaurantReviews(restaurantId: string): Promise<IReview[]> {
  if (!restaurantId) return [];

  try {
    const res = await apiClient.get(
      API_ENDPOINTS.REVIEWS_BY_RESTAURANT(restaurantId)
    );
    return extractArray<IReview>(res.data);
  } catch (err) {
    console.error('Error fetching restaurant reviews:', err);
    return [];
  }
}

/**
 * Crea una nueva reseña
 */
export async function createReview(review: Omit<IReview, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<IReview | null> {
  try {
    const res = await apiClient.post<IReview>(API_ENDPOINTS.REVIEWS, review);
    return res.data ?? null;
  } catch (err) {
    console.error('Error creating review:', err);
    return null;
  }
}

/**
 * Actualiza una reseña existente
 */
export async function updateReview(reviewId: string, updates: Partial<IReview>): Promise<IReview | null> {
  try {
    const res = await apiClient.put<IReview>(`${API_ENDPOINTS.REVIEWS}/${reviewId}`, updates);
    return res.data ?? null;
  } catch (err) {
    console.error('Error updating review:', err);
    return null;
  }
}

/**
 * Elimina una reseña
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.REVIEWS}/${reviewId}`);
    return true;
  } catch (err) {
    console.error('Error deleting review:', err);
    return false;
  }
}

export const reviewService = {
  fetchAllReviews,
  fetchRestaurantReviews,
  createReview,
  updateReview,
  deleteReview,
};
