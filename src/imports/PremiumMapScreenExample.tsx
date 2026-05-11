import { useEffect, type FC } from 'react';
import MapScreenPremium from './MapScreenPremium';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useLocationStore } from '@/stores/locationStore';
import type { Restaurant } from '@/types/Restaurant';

export const PremiumMapScreenExample: FC = () => {
  const restaurants = useRestaurantStore((s: any) => s.restaurants as Restaurant[]);
  const loading = useRestaurantStore((s: any) => s.loading as boolean);
  const loadRestaurants = useRestaurantStore((s: any) => s.loadRestaurants as () => Promise<void>);
  const coords = useLocationStore((s: any) => s.coords as { lat: number; lng: number } | null);
  const requestLocation = useLocationStore((s: any) => s.requestLocation as () => Promise<void>);

  useEffect(() => {
	void loadRestaurants();
	void requestLocation();
  }, [loadRestaurants, requestLocation]);

  return (
	<MapScreenPremium
	  restaurants={restaurants}
	  userLocation={coords}
	  isLoading={loading}
	  onRestaurantOpen={(id) => {
		useRestaurantStore.getState().setSelected(id);
	  }}
	/>
  );
};

/**
 * ENHANCED MAP SCREEN IMPROVEMENTS:
 *
 * 1. Search & Filtering:
 *    ✓ Premium search bar with real-time filtering
 *    ✓ Distance, time, and price filters
 *    ✓ Expandable filter UI
 *
 * 2. Performance Optimizations:
 *    ✓ Memoized marker rendering
 *    ✓ Optional marker clustering
 *    ✓ Optimized restaurant filtering
 *    ✓ Lazy loading of components
 *
 * 3. Enhanced UX:
 *    ✓ Floating control bar with multiple actions
 *    ✓ Map stats overlay (top-left)
 *    ✓ Search bar (top-right on desktop)
 *    ✓ Empty states for no results
 *    ✓ Reset functionality
 *
 * 4. Mobile-First Design:
 *    ✓ Responsive search bar positioning
 *    ✓ Touch-optimized controls
 *    ✓ Bottom sheet restaurant card
 *    ✓ Safe area considerations
 *
 * 5. Accessibility:
 *    ✓ ARIA labels on all interactive elements
 *    ✓ Keyboard navigation support
 *    ✓ Focus management
 *    ✓ Screen reader friendly
 *
 * 6. Code Quality:
 *    ✓ TypeScript type safety
 *    ✓ Proper memoization with useCallback/useMemo
 *    ✓ Clean component composition
 *    ✓ Well-documented props
 */

export default PremiumMapScreenExample;

