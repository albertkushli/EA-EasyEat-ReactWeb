// ============================================
// SERVICIO DE EMPLEADOS
// ============================================

import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../constants';
import { IEmployeeStats } from '../types';
import { extractArray } from '../utils/response-parser';

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

export const employeeService = {
  fetchEmployeesWithStats,
};
