import { create } from 'zustand';
import type { Restaurant } from '@/types/Restaurant';
import { fetchRestaurants, fetchNearbyRestaurants } from '@/services/restaurant.service';


interface RestaurantStore {
  restaurants: Restaurant[];
  loading: boolean;
  loadRestaurants: () => Promise<void>;
  loadNearby: (lat: number, lng: number, maxDistance?: number) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  restaurants: [],
  loading: false,
  
  loadRestaurants: async () => {
    set({ loading: true });
    try {
      const res = await fetchRestaurants(1, 1000);
      // fetchRestaurants returns a paginated response: { data, meta }
      const data = (res as any).data ?? (res as any);
      if (Array.isArray(data) && data.length > 0) {
        set({ restaurants: data as Restaurant[], loading: false });
      } else if (Array.isArray((res as any).data) && (res as any).data.length > 0) {
        set({ restaurants: (res as any).data as Restaurant[], loading: false });
      } else {
        // No data from API — set empty list
        set({ restaurants: [], loading: false });
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
      set({ restaurants: [], loading: false });
    }
  },
  
  loadNearby: async (lat: number, lng: number, maxDistance: number = 5000) => {
    set({ loading: true });
    try {
      const nearby = await fetchNearbyRestaurants(lat, lng, maxDistance);
      // Mark results as nearby when appropriate (some APIs include distanceKm)
      const annotated = nearby.map((r: any) => ({ ...(r as any), isNearby: true }));
      set({ restaurants: annotated as Restaurant[], loading: false });
    } catch (err) {
      console.error('Error loading nearby restaurants:', err);
      set({ restaurants: [], loading: false });
    }
  },
}));

