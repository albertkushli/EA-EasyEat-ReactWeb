// ============================================
// SERVICIO DE CLIENTES
// ============================================

import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '../constants';
import { ICustomer } from '../types';

/**
 * Obtiene un cliente por ID con relaciones pobladas (visitas, reseñas, etc.)
 */
export async function fetchCustomerFull(customerId: string): Promise<any | null> {
  if (!customerId) return null;

  try {
    const res = await apiClient.get<any>(
      API_ENDPOINTS.CUSTOMER_FULL(customerId)
    );
    return res.data ?? null;
  } catch (err) {
    console.error('Error fetching customer full:', err);
    return null;
  }
}

/**
 * Obtiene un cliente por ID
 */
export async function fetchCustomer(customerId: string): Promise<ICustomer | null> {
  if (!customerId) return null;

  try {
    const res = await apiClient.get<ICustomer>(
      API_ENDPOINTS.CUSTOMER_BY_ID(customerId)
    );
    return res.data ?? null;
  } catch (err) {
    console.error('Error fetching customer:', err);
    return null;
  }
}

/**
 * Actualiza un cliente
 */
export async function updateCustomer(customerId: string, updates: Partial<ICustomer>): Promise<ICustomer | null> {
  try {
    const res = await apiClient.put<ICustomer>(
      API_ENDPOINTS.CUSTOMER_BY_ID(customerId),
      updates
    );
    return res.data ?? null;
  } catch (err) {
    console.error('Error updating customer:', err);
    return null;
  }
}

/**
 * Elimina un cliente (soft delete)
 */
export async function deleteCustomer(customerId: string): Promise<boolean> {
  try {
    await apiClient.delete(API_ENDPOINTS.CUSTOMER_BY_ID(customerId));
    return true;
  } catch (err) {
    console.error('Error deleting customer:', err);
    return false;
  }
}

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

export const getAllCustomers = async () => {
  try {
    const response = await apiClient.get(`/customers?limit=1000`);
    const json = response.data;
    return Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
  } catch (error: any) {
    console.error("getAllCustomers error:", error.response?.data || error.message);
    throw error;
  }
};

export const customerService = {
  fetchCustomer,
  fetchCustomerFull,
  updateCustomer,
  deleteCustomer,
  getCustomersByRestaurant,
  getAllCustomers,
};
