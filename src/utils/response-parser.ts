// ============================================
// UTILIDADES PARA PARSEAR RESPUESTAS API
// ============================================

import { IPaginatedResponse, IPaginationMeta } from '../types';
import { DEFAULT_META } from '../constants';

/**
 * Normaliza respuestas paginadas del backend
 * Soporta múltiples formatos de respuesta
 */
export function parsePaginatedResponse<T>(
  payload: any,
  fallbackLimit: number = 10
): IPaginatedResponse<T> {
  // Caso: { visits: [] }
  if (Array.isArray(payload?.visits)) {
    const visitsData = payload.visits;
    return {
      data: visitsData,
      meta: {
        total: visitsData.length,
        page: 1,
        limit: fallbackLimit,
        totalPages: 1,
      },
    };
  }

  // Caso estándar: { data: [], meta: {} }
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const rawMeta = payload?.meta || {};

  const total = Number.isFinite(rawMeta.total) ? rawMeta.total : data.length;
  const page = Number.isFinite(rawMeta.page) ? rawMeta.page : 1;
  const limit = Number.isFinite(rawMeta.limit) ? rawMeta.limit : fallbackLimit;

  const totalPages = Number.isFinite(rawMeta.totalPages)
    ? rawMeta.totalPages
    : Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    data,
    meta: { total, page, limit, totalPages },
  };
}

/**
 * Extrae array de datos de múltiples formatos de respuesta
 */
export function extractArray<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  if (Array.isArray(payload?.visits)) return payload.visits;
  if (Array.isArray(payload?.employees)) return payload.employees;
  return [];
}

/**
 * Ordena items por fecha descendente (más recientes primero)
 */
export function sortByDateDesc<T extends { date?: any; createdAt?: any }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.date || b.createdAt).getTime() -
      new Date(a.date || a.createdAt).getTime()
  );
}

/**
 * Valida si es un objeto vacío
 */
export function isEmpty(obj: any): boolean {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Normaliza ID (soporta _id y id)
 */
export function getId(obj: any): string | undefined {
  return obj?._id ?? obj?.id;
}
