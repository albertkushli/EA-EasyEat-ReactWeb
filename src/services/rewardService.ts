import apiClient from "../lib/apiClient";

export const getRewardsByRestaurant = async (restaurantId: string) => {
  if (!restaurantId) {
    console.warn("getRewardsByRestaurant: No restaurantId provided");
    return [];
  }

  try {
    const response = await apiClient.get(`/rewards/restaurant/${restaurantId}`);
    // Based on previous patterns, we expect { data: [...] } or just the array
    const json = response.data;
    return Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch (error: any) {
    console.error("getRewardsByRestaurant error:", error.response?.data || error.message);
    throw error;
  }
};
