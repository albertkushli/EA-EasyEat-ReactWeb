// ============================================
// SERVICIO DE EMPLEADOS
// ============================================

import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '../constants';
import { IEmployeeStats } from '../types';
import { extractArray } from '../utils/response-parser';
import { create } from 'node_modules/axios/index.cjs';

/**
 * Obtiene lista de empleados con estadísticas
 */
export async function fetchEmployeesWithStats(restaurantId: string): Promise<IEmployeeStats[]> {
  if (!restaurantId) return [];

  try {
    const res = await apiClient.get(
      API_ENDPOINTS.EMPLOYEES_WITH_STATS(restaurantId)
    );

    // Normaliza respuesta: { data: [...] } o [...]
    const employees = extractArray<IEmployeeStats>(res.data);
    return Array.isArray(employees) ? employees : [];
  } catch (err) {
    console.error('Error fetching employees with stats:', err);
    return [];
  }
}

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
    const response = await apiClient.delete(`/employees/${employeeId}/hard`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

export const employeeService = {
  fetchEmployeesWithStats,
  getEmployeesByRestaurant,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
