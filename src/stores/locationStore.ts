import { create } from 'zustand';

interface LocationStore {
  coords: { lat: number; lng: number } | null;
  requestLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationStore>((set) => ({
  coords: null,

  requestLocation: async () => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            set({
              coords: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            });
            resolve();
          },
          () => {
            // Default to Barcelona if permission denied
            set({
              coords: {
                lat: 41.3851,
                lng: 2.1734,
              },
            });
            resolve();
          },
        );
      } else {
        // Default to Barcelona if geolocation not available
        set({
          coords: {
            lat: 41.3851,
            lng: 2.1734,
          },
        });
        resolve();
      }
    });
  },
}));
