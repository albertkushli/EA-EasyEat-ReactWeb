import create from 'zustand';
import type { Restaurant, RestaurantId } from '@/types/Restaurant';
import { fetchRestaurantsMock } from '@/services/mockApi';

type State = {
  restaurants: Restaurant[];
  loading: boolean;
  selectedId?: RestaurantId | null;
  nearbyMode: boolean;
  loadRestaurants: () => Promise<void>;
  loadNearby: (lat: number, lng: number) => Promise<void>;
  setSelected: (id?: RestaurantId | null) => void;
  clear: () => void;
};

export const useRestaurantStore = create<State>((set: any) => ({
  restaurants: [],
  loading: false,
  selectedId: null,
  nearbyMode: false,

  loadRestaurants: async () => {
    set({ loading: true });
    const items = await fetchRestaurantsMock();
    set({ restaurants: items, loading: false, nearbyMode: false });
  },

  loadNearby: async (lat: number, lng: number) => {
    set({ loading: true });
    // For mock: mark a subset as nearby based on distance to provided coords
    const items = await fetchRestaurantsMock();
    const withNearby = items.map((r) => {
      const dLat = (r.profile.location.coordinates.coordinates[1] - lat) * 111; // rough km
      const dLng = (r.profile.location.coordinates.coordinates[0] - lng) * 85;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return { ...r, isNearby: dist < 3, distanceKm: Math.round(dist * 10) / 10 };
    });
    set({ restaurants: withNearby, loading: false, nearbyMode: true });
  },

  setSelected: (id?: RestaurantId | null) => set({ selectedId: id ?? null }),

  clear: () => set({ restaurants: [], selectedId: null, nearbyMode: false }),
}));

