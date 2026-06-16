import apiClient from './apiClient';
import { IVisit } from '@/types';

export const getVisitsByRestaurant = async (restaurantId: string): Promise<IVisit[]> => {
  try {
    // We request a large limit to ensure we get all visits for the logic to work
    const response = await apiClient.get(`/visits/restaurant/${restaurantId}?limit=1000`);
    const json = response.data;
    return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  } catch (error) {
    console.error('Error fetching visits by restaurant:', error);
    return [];
  }
};

export const visitService = {
  getVisitsByRestaurant,
};
