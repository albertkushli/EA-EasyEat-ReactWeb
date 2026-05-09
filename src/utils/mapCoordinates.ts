import type { Restaurant } from '@/types/Restaurant';

export type MapCoordinates = { lat: number; lng: number };

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

function fromLatLngObject(value: any): MapCoordinates | null {
  if (!value || typeof value !== 'object') return null;

  const lat = toFiniteNumber(value.lat ?? value.latitude);
  const lng = toFiniteNumber(value.lng ?? value.lon ?? value.longitude);

  if (lat === null || lng === null) return null;
  return { lat, lng };
}

function fromCoordinateArray(value: unknown): MapCoordinates | null {
  if (!Array.isArray(value) || value.length < 2) return null;

  const lng = toFiniteNumber(value[0]);
  const lat = toFiniteNumber(value[1]);

  if (lat === null || lng === null) return null;
  return { lat, lng };
}

export function getRestaurantCoordinates(restaurant: Restaurant): MapCoordinates | null {
  const rawCoordinates = restaurant?.profile?.location?.coordinates?.coordinates;

  return (
    fromCoordinateArray(rawCoordinates) ||
    fromLatLngObject(rawCoordinates) ||
    fromLatLngObject((restaurant as any)?.profile?.location) ||
    fromLatLngObject((restaurant as any)?.location) ||
    fromLatLngObject(restaurant as any)
  );
}

export function getRestaurantCoordinateKey(restaurant: Restaurant): string {
  const coords = getRestaurantCoordinates(restaurant);
  return coords ? `${coords.lat},${coords.lng}` : 'no-coords';
}

