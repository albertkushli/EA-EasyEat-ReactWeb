import create from 'zustand';
import type { Coordinates, PermissionState } from '@/types/Location';

type State = {
  coords?: Coordinates | null;
  permission: PermissionState;
  loading: boolean;
  requestLocation: () => Promise<void>;
  setCoords: (c?: Coordinates | null) => void;
};

export const useLocationStore = create<State>((set: any) => ({
  coords: null,
  permission: 'unknown',
  loading: false,
  requestLocation: async () => {
    if (!('geolocation' in navigator)) {
      set({ permission: 'denied' });
      return;
    }
    set({ loading: true });
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          set({ coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }, permission: 'granted', loading: false });
          resolve();
        },
        () => {
          set({ coords: null, permission: 'denied', loading: false });
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  },
  setCoords: (c?: any) => set({ coords: c ?? null }),
}));

