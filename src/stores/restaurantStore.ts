import { create } from 'zustand';
import type { Restaurant } from '@/types/Restaurant';
import { fetchRestaurants, fetchNearbyRestaurants } from '@/services/restaurant.service';

export interface RestaurantStore {
  restaurants: Restaurant[];
  loading: boolean;
  selectedId: string | null;
  loadRestaurants: () => Promise<void>;
  loadNearby: (lat: number, lng: number, maxDistance?: number) => Promise<void>;
  setSelected: (id?: string | null) => void;
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  restaurants: [],
  loading: false,
  selectedId: null,

  setSelected: (id?: string | null) => {
    set({ selectedId: id ?? null });
  },

  loadRestaurants: async () => {
    set({ loading: true });
    try {
      const restaurantList = (await fetchRestaurants()) as unknown as Restaurant[];
      set({ restaurants: restaurantList, loading: false });
    } catch (err) {
      console.error('Error loading restaurants:', err);
      set({ restaurants: [], loading: false });
    }
  },

  loadNearby: async (lat: number, lng: number, maxDistance: number = 5000) => {
    set({ loading: true });
    try {
      const nearby = (await fetchNearbyRestaurants(
        lat,
        lng,
        maxDistance,
      )) as unknown as Restaurant[];
      // Mark results as nearby when appropriate (some APIs include distanceKm)
      const annotated: Restaurant[] = nearby.map((r) => ({ ...r, isNearby: true }) as Restaurant);
      set({ restaurants: annotated, loading: false });
    } catch (err) {
      console.error('Error loading nearby restaurants:', err);
      set({ restaurants: [], loading: false });
    }
  },
}));
