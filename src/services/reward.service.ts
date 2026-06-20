import { isAxiosError } from 'axios';
import apiClient from '@/services/apiClient';
import { Reward } from '@/types/Reward';
import { API_ENDPOINTS } from '../constants';

export const getRewardsByRestaurant = async (restaurantId: string) => {
  if (!restaurantId) {
    console.warn('getRewardsByRestaurant: No restaurantId provided');
    return [];
  }

  try {
    const response = await apiClient.get(`/rewards/restaurant/${restaurantId}`);
    const json = response.data;
    const data = json?.data || json;
    return Array.isArray(data) ? data : data.rewards || [];
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('getRewardsByRestaurant error:', error.response?.data || error.message);
    } else {
      console.error('getRewardsByRestaurant error:', error);
    }
    throw error;
  }
};

export const createReward = async (rewardData: Partial<Reward>) => {
  try {
    const response = await apiClient.post('/rewards', rewardData);
    return response.data?.data || response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('createReward error:', error.response?.data || error.message);
    } else {
      console.error('createReward error:', error);
    }
    throw error;
  }
};

export const updateReward = async (rewardId: string, rewardData: Partial<Reward>) => {
  try {
    const response = await apiClient.put(`/rewards/${rewardId}`, rewardData);
    return response.data?.data || response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('updateReward error:', error.response?.data || error.message);
    } else {
      console.error('updateReward error:', error);
    }
    throw error;
  }
};

export const deleteReward = async (rewardId: string, restaurantId: string) => {
  try {
    const response = await apiClient.delete(`/rewards/${rewardId}/soft`, {
      params: { restaurant_id: restaurantId },
    });
    return response.data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      console.error('deleteReward error:', error.response?.data || error.message);
    } else {
      console.error('deleteReward error:', error);
    }
    throw error;
  }
};

/**
 * Obtiene los canjes (redemptions) de un restaurante
 */
export async function fetchRedemptionsByRestaurant(restaurantId: string): Promise<unknown[]> {
  if (!restaurantId) return [];

  try {
    const res = await apiClient.get(API_ENDPOINTS.REWARD_REDEMPTIONS_BY_RESTAURANT(restaurantId));
    const json = res.data;
    const data = json?.data || json;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error fetching restaurant redemptions:', err);
    return [];
  }
}
