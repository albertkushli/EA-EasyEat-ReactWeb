import apiClient from "@/services/apiClient";

export const getCustomersByRestaurant = async (restaurantId: string) => {
  if (!restaurantId) {
    console.warn("getCustomersByRestaurant: No restaurantId provided");
    return [];
  }

  try {
    const response = await apiClient.get(`/customers/restaurant/${restaurantId}`);
    
    // apiClient (axios) returns the response data directly or in .data
    // Based on how controllers work, it returns { data: [...], meta: ... }
    const json = response.data;
    
    return Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch (error: any) {
    console.error("getCustomersByRestaurant error:", error.response?.data || error.message);
    throw error;
  }
};

