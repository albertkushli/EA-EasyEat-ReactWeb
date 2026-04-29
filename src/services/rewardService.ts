import apiClient from "../lib/apiClient";
import { Reward } from "../types/Reward";

export const getRewardsByRestaurant = async (restaurantId: string) => {
  if (!restaurantId) {
    console.warn("getRewardsByRestaurant: No restaurantId provided");
    return [];
  }

  try {
    const response = await apiClient.get(`/rewards/restaurant/${restaurantId}`);
    const json = response.data;
    const data = json?.data || json;
    return Array.isArray(data) ? data : (data.rewards || []);
  } catch (error: any) {
    console.error("getRewardsByRestaurant error:", error.response?.data || error.message);
    throw error;
  }
};

export const createReward = async (rewardData: Partial<Reward>) => {
  try {
    const response = await apiClient.post("/rewards", rewardData);
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error("createReward error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateReward = async (rewardId: string, rewardData: Partial<Reward>) => {
  try {
    const response = await apiClient.put(`/rewards/${rewardId}`, rewardData);
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error("updateReward error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteReward = async (rewardId: string) => {
  try {
    const response = await apiClient.delete(`/rewards/${rewardId}/soft`);
    return response.data;
  } catch (error: any) {
    console.error("deleteReward error:", error.response?.data || error.message);
    throw error;
  }
};
