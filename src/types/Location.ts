export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type PermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

export {};

