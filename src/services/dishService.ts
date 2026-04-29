import apiClient from "../lib/apiClient";
import { Dish } from "../types/Dish";

export const getDishes = async () => {
  try {
    const response = await apiClient.get("/dishes");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching dishes:", error);
    throw error;
  }
};

export const getDishesByRestaurant = async (restaurantId: string) => {
  if (!restaurantId) {
    console.warn("getDishesByRestaurant: No restaurantId provided");
    return [];
  }

  try {
    const response = await apiClient.get(`/dishes/restaurant/${restaurantId}`);
    const data = response.data?.data || response.data || [];
    // Ensure we return an array
    return Array.isArray(data) ? data : (data.dishes || []);
  } catch (error) {
    console.error("Error fetching dishes by restaurant:", error);
    throw error;
  }
};

export const createDish = async (dishData: Partial<Dish>) => {
  try {
    const response = await apiClient.post("/dishes", dishData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error creating dish:", error);
    throw error;
  }
};

export const updateDish = async (dishId: string, dishData: Partial<Dish>) => {
  try {
    const response = await apiClient.put(`/dishes/${dishId}`, dishData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating dish:", error);
    throw error;
  }
};

export const deleteDish = async (dishId: string) => {
  try {
    const response = await apiClient.delete(`/dishes/${dishId}/soft`);
    return response.data;
  } catch (error) {
    console.error("Error deleting dish:", error);
    throw error;
  }
};