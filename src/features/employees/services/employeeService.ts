import apiClient from "@/services/apiClient";

export const getEmployeesByRestaurant = async (restaurantId: string) => {
  try {
    const response = await apiClient.get(`/employees/restaurant/${restaurantId}/stats`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const createEmployee = async (employeeData: any) => {
  try {
    const response = await apiClient.post("/employees", employeeData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const updateEmployee = async (employeeId: string, employeeData: any) => {
  try {
    const response = await apiClient.put(`/employees/${employeeId}`, employeeData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

export const deleteEmployee = async (employeeId: string) => {
  try {
    const response = await apiClient.delete(`/employees/${employeeId}/soft`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

