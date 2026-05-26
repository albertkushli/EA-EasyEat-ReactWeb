import { useCallback, useEffect } from 'react';
import { useLocationStore } from '@/stores/locationStore';
import { useRestaurantStore } from '@/stores/restaurantStore';

export function useMapExperienceData() {
  const loadRestaurants = useRestaurantStore((s) => s.loadRestaurants);
  const loadNearby = useRestaurantStore((s) => s.loadNearby);
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const loading = useRestaurantStore((s) => s.loading);
  const coords = useLocationStore((s) => s.coords);
  const requestLocation = useLocationStore((s) => s.requestLocation);

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  const handleRequestNearby = useCallback(async () => {
    await requestLocation();
    const currentCoords = useLocationStore.getState().coords;

    if (currentCoords) {
      await loadNearby(currentCoords.lat, currentCoords.lng);
    }
  }, [loadNearby, requestLocation]);

  return {
    restaurants,
    loading,
    coords,
    handleRequestNearby,
  };
}
