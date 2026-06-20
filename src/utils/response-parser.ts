// ============================================
// UTILIDADES PARA PARSEAR RESPUESTAS API
// ============================================

import { IPaginatedResponse, IPaginationMeta } from '../types';

/**
 * Normaliza respuestas paginadas del backend
 * Soporta múltiples formatos de respuesta
 */
export function parsePaginatedResponse<T>(
  payload: unknown,
  fallbackLimit: number = 10,
): IPaginatedResponse<T> {
  const p = payload as Record<string, unknown> | null;

  // Caso: { visits: [] }
  if (p && Array.isArray(p.visits)) {
    const visitsData = p.visits as T[];
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
  const data = p && Array.isArray(p.data) ? (p.data as T[]) : [];
  const rawMeta = (p?.meta as Partial<IPaginationMeta>) || {};

  const total = rawMeta.total != null ? Number(rawMeta.total) : data.length;
  const page = rawMeta.page != null ? Number(rawMeta.page) : 1;
  const limit = rawMeta.limit != null ? Number(rawMeta.limit) : fallbackLimit;

  const totalPages =
    rawMeta.totalPages != null
      ? Number(rawMeta.totalPages)
      : Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    data,
    meta: { total, page, limit, totalPages },
  };
}

/**
 * Extrae array de datos de múltiples formatos de respuesta
 */
export function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const p = payload as Record<string, unknown> | null;
  if (p && Array.isArray(p.data)) return p.data as T[];
  if (p && Array.isArray(p.reviews)) return p.reviews as T[];
  if (p && Array.isArray(p.visits)) return p.visits as T[];
  if (p && Array.isArray(p.employees)) return p.employees as T[];
  return [];
}

/**
 * Ordena items por fecha descendente (más recientes primero)
 */
export function sortByDateDesc<T extends { date?: string | Date; createdAt?: string | Date }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const dateA = a.date || a.createdAt;
    const dateB = b.date || b.createdAt;
    return new Date(dateB as string | Date).getTime() - new Date(dateA as string | Date).getTime();
  });
}

/**
 * Valida si es un objeto vacío
 */
export function isEmpty(obj: unknown): boolean {
  return !obj || typeof obj !== 'object' || Object.keys(obj as object).length === 0;
}

/**
 * Normaliza ID (soporta _id y id)
 */
export function getId(obj: unknown): string | undefined {
  const p = obj as Record<string, unknown> | null;
  return (p?._id as string | undefined) ?? (p?.id as string | undefined);
}
