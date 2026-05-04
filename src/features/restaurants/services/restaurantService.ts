import apiClient from "@/services/apiClient";

export const updateRestaurant = async (restaurantId: string, restaurantData: any) => {
  try {
    const response = await apiClient.put(`/restaurants/${restaurantId}`, restaurantData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
};

export const getRestaurant = async (restaurantId: string) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
};

