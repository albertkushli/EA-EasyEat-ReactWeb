// ============================================
// SERVICIO DE CLIENTES
// ============================================

import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../constants';
import { ICustomer } from '../types';

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

export const customerService = {
  fetchCustomer,
  updateCustomer,
  deleteCustomer,
};
