import apiClient from "../lib/apiClient";

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
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching dishes by restaurant:", error);
    throw error;
  }
};