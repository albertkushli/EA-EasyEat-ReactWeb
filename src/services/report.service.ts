import { API_ENDPOINTS } from '@/constants';
import apiClient from '@/services/apiClient';

export async function createRestaurantReport(restaurantId: string, reason: string): Promise<any | null> {
  if (!restaurantId) return null;

  try {
    const response = await apiClient.post(API_ENDPOINTS.RESTAURANT_REPORT(restaurantId), {
      reason,
    });

    return response.data?.data ?? response.data ?? null;
  } catch (error) {
    console.error('Error creating restaurant report:', error);
    return null;
  }
}

export async function fetchReports(): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export async function updateReport(reportId: string, updates: Record<string, unknown>): Promise<any | null> {
  if (!reportId) return null;

  try {
    const response = await apiClient.put(API_ENDPOINTS.REPORT_BY_ID(reportId), updates);
    return response.data?.data ?? response.data ?? null;
  } catch (error) {
    console.error('Error updating report:', error);
    return null;
  }
}

export async function deleteReport(reportId: string): Promise<boolean> {
  if (!reportId) return false;

  try {
    await apiClient.delete(API_ENDPOINTS.REPORT_BY_ID(reportId));
    return true;
  } catch (error) {
    console.error('Error deleting report:', error);
    return false;
  }
}

export const reportService = {
  createRestaurantReport,
  fetchReports,
  updateReport,
  deleteReport,
};