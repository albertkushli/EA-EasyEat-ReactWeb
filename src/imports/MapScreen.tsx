import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { useLoadScript, GoogleMap, Marker, MarkerClusterer } from '@react-google-maps/api';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useLocationStore } from '@/stores/locationStore';
import RestaurantCard from './RestaurantCard';
import LoadingOverlay from './LoadingOverlay';
import MapOverlay from './MapOverlay';
import PremiumSearchBar from './PremiumSearchBar';
import FloatingControlBar from './FloatingControlBar';
import SeeNearMeButton from './SeeNearMeButton';
import { AnimatePresence, motion } from 'framer-motion';
import type { Restaurant } from '@/types/Restaurant';
import { useNavigate, useLocation } from 'react-router-dom';
import { MODERN_MAP_STYLE } from '@/utils/mapStyles';
import { createMarkerUrl } from './MapMarker';
import { Layers, RotateCcw } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%'
} as const;

const DEFAULT_CENTER = { lat: 41.3851, lng: 2.1734 };
const DEFAULT_ZOOM = 13;
const NEARBY_ZOOM = 15;

const LIBRARIES: ('places')[] = ['places'];

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

function getRestaurantCoordinates(restaurant: Restaurant) {
  const rawCoordinates = restaurant?.profile?.location?.coordinates?.coordinates;

  if (Array.isArray(rawCoordinates) && rawCoordinates.length >= 2) {
    const lng = toFiniteNumber(rawCoordinates[0]);
    const lat = toFiniteNumber(rawCoordinates[1]);
    if (lat !== null && lng !== null) return { lat, lng };
  }

  const candidates = [
    rawCoordinates,
    (restaurant as any)?.profile?.location,
    (restaurant as any)?.location,
    restaurant as any,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const lat = toFiniteNumber(candidate.lat ?? candidate.latitude);
    const lng = toFiniteNumber(candidate.lng ?? candidate.lon ?? candidate.longitude);
    if (lat !== null && lng !== null) return { lat, lng };
  }

  return null;
}

function getRestaurantCoordinateKey(restaurant: Restaurant): string {
  const coords = getRestaurantCoordinates(restaurant);
  return coords ? `${coords.lat},${coords.lng}` : 'no-coords';
}

interface Filters {
  distance: string;
  time: string;
  price: string;
}

/**
 * Memoized marker component for performance optimization
 * Only re-renders when selection state or restaurant ID changes
 */
const OptimizedMarker = memo(
  ({
    restaurant,
    isSelected,
    onClick,
    clusterer,
  }: {
    restaurant: Restaurant;
    isSelected: boolean;
    onClick: () => void;
    clusterer?: any;
  }) => {
    const coords = getRestaurantCoordinates(restaurant);
    const isNearby = (restaurant as any).isNearby;
    const markerColor = isNearby ? '#ff9800' : '#e53935';

    // Memoize marker URL to avoid regenerating on every render
    const markerUrl = useMemo(
      () => createMarkerUrl(markerColor, 36, isSelected, isNearby),
      [markerColor, isSelected, isNearby]
    );

    // Memoize icon config to avoid recreating object
    const iconConfig = useMemo(
      () => ({
        url: markerUrl,
        scaledSize: new (window as any).google.maps.Size(36, 36),
        anchor: new (window as any).google.maps.Point(18, 36),
      }),
      [markerUrl]
    );

    if (!coords) return null;

    return (
      <Marker
        position={coords}
        onClick={onClick}
        icon={iconConfig}
        animation={isSelected ? (window as any).google.maps.Animation.BOUNCE : undefined}
        clusterer={clusterer}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimal re-rendering
    const prevCoordsKey = getRestaurantCoordinateKey(prevProps.restaurant);
    const nextCoordsKey = getRestaurantCoordinateKey(nextProps.restaurant);

    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.restaurant._id === nextProps.restaurant._id &&
      (prevProps.restaurant as any).isNearby === (nextProps.restaurant as any).isNearby &&
      prevCoordsKey === nextCoordsKey
    );
  }
);

OptimizedMarker.displayName = 'OptimizedMarker';

/**
 * User location marker component
 */
const UserLocationMarker = memo(
  ({ coords }: { coords?: any }) => {
    if (!coords) return null;

    return (
      <Marker
        position={{ lat: coords.lat, lng: coords.lng }}
        icon={{
          url: createMarkerUrl('#3b82f6', 28, false, false),
          scaledSize: new (window as any).google.maps.Size(28, 28),
          anchor: new (window as any).google.maps.Point(14, 14),
        }}
        clickable={false}
      />
    );
  }
);

UserLocationMarker.displayName = 'UserLocationMarker';


/**
 * Filter restaurants based on search query and filters
 */
function filterRestaurants(
  restaurants: Restaurant[],
  searchQuery: string,
  filters: Filters,
  userCoords?: { lat: number; lng: number } | null
): Restaurant[] {
  return restaurants.filter((restaurant) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = restaurant.profile?.name?.toLowerCase() || '';
      const category = restaurant.profile?.category?.join(' ').toLowerCase() || '';
      const city = restaurant.profile?.location?.city?.toLowerCase() || '';

      if (!name.includes(query) && !category.includes(query) && !city.includes(query)) {
        return false;
      }
    }

    // Distance filter
    if (filters.distance !== 'all' && userCoords) {
      const distanceKm = (restaurant as any).distanceKm;
      const maxDistance = parseFloat(filters.distance.replace('km', ''));
      if (distanceKm && distanceKm > maxDistance) {
        return false;
      }
    }

    // Price filter - basic implementation
    if (filters.price !== 'all') {
      // This is a simplified price filter - adjust based on your data structure
      const descLength = restaurant.profile?.description?.length || 0;
      const priceLevel = descLength > 100 ? '$$$' : descLength > 50 ? '$$' : '$';
      if (priceLevel !== filters.price) {
        return false;
      }
    }

    return true;
  });
}

export default function MapScreen() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string || '',
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const restaurants = useRestaurantStore((s: any) => s.restaurants as Restaurant[]);
  const loading = useRestaurantStore((s: any) => s.loading as boolean);
  const loadRestaurants = useRestaurantStore((s: any) => s.loadRestaurants as () => Promise<void>);
  const loadNearby = useRestaurantStore(
    (s: any) => s.loadNearby as (lat: number, lng: number, maxDistance?: number) => Promise<void>
  );
  const selectedId = useRestaurantStore((s: any) => s.selectedId as string | undefined | null);
  const setSelected = useRestaurantStore((s: any) => s.setSelected as (id?: string | null) => void);

  const { coords, requestLocation } = useLocationStore();
  const [internalLoading, setInternalLoading] = useState(false);
  const [mapReadyForClick, setMapReadyForClick] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    distance: 'all',
    time: 'all',
    price: 'all',
  });
  const [showClusters, setShowClusters] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Initial load
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  // Handle opening specific restaurant from navigation state
  useEffect(() => {
    if (!mapReadyForClick) return;

    const state = (location.state as any) || {};
    if (state.openRestaurantId) {
      setTimeout(() => {
        setSelected(state.openRestaurantId);
        const r = restaurants.find((x) => x._id === state.openRestaurantId);
        const restaurantCoords = r ? getRestaurantCoordinates(r) : null;
        if (restaurantCoords && mapRef.current) {
          mapRef.current.panTo(restaurantCoords);
          mapRef.current.setZoom(NEARBY_ZOOM);
        }
      }, 300);
    }
  }, [location.state, restaurants, setSelected, mapReadyForClick]);

  // Pan to user location when coords change
  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.panTo({ lat: coords.lat, lng: coords.lng });
      mapRef.current.setZoom(NEARBY_ZOOM);
    }
  }, [coords]);

  const handleSeeNearMe = useCallback(async () => {
    setInternalLoading(true);
    await requestLocation();
    const currentCoords = useLocationStore.getState().coords;
    if (currentCoords) {
      await loadNearby(currentCoords.lat, currentCoords.lng, 5000);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: currentCoords.lat, lng: currentCoords.lng });
        mapRef.current.setZoom(NEARBY_ZOOM);
      }
    }
    setInternalLoading(false);
  }, [requestLocation, loadNearby]);

  // Filter and search restaurants
  const filteredRestaurants = useMemo(
    () => filterRestaurants(restaurants, searchQuery, filters, coords),
    [restaurants, searchQuery, filters, coords]
  );

  const center = useMemo(
    () => (coords ? { lat: coords.lat, lng: coords.lng } : DEFAULT_CENTER),
    [coords]
  );

  const nearbyCount = useMemo(
    () => filteredRestaurants.filter((r) => (r as any).isNearby).length,
    [filteredRestaurants]
  );

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Clear selection when searching
    if (query && selectedId) {
      setSelected(null);
    }
  }, [selectedId, setSelected]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    // Clear selection when filtering
    if (selectedId) {
      setSelected(null);
    }
  }, [selectedId, setSelected]);

  // Reset filters and search
  const handleReset = useCallback(() => {
    setSearchQuery('');
    setFilters({
      distance: 'all',
      time: 'all',
      price: 'all',
    });
    setSelected(null);
    if (mapRef.current) {
      mapRef.current.panTo(DEFAULT_CENTER);
      mapRef.current.setZoom(DEFAULT_ZOOM);
    }
  }, [setSelected]);

  if (loadError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-full flex items-center justify-center bg-gray-50"
      >
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900">Unable to Load Maps</h1>
          <p className="text-gray-600">Please check your internet connection</p>
        </div>
      </motion.div>
    );
  }

  if (!isLoaded) return <LoadingOverlay show />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen w-full relative bg-gradient-to-b from-blue-50 to-white overflow-hidden"
    >
      {/* Map container */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={DEFAULT_ZOOM}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: (window as any).google?.maps?.ControlPosition?.RIGHT_BOTTOM,
          },
          styles: MODERN_MAP_STYLE,
          gestureHandling: 'greedy',
          restriction: {
            latLngBounds: {
              north: 85,
              south: -85,
              west: -180,
              east: 180,
            },
            strictBounds: false,
          },
        }}
        onLoad={(map) => {
          onMapLoad(map);
          setMapReadyForClick(true);
        }}
        onDrag={() => {
          if (selectedId) {
            setSelected(null);
          }
        }}
      >
        {showClusters ? (
          <MarkerClusterer
            options={{
              maxZoom: 14,
              styles: [
                {
                  height: 53,
                  width: 53,
                  textColor: '#ffffff',
                  background: 'rgba(255, 107, 53, 0.8)',
                  borderRadius: '50%',
                  lineHeight: '53px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                },
              ] as any,
            }}
          >
            {(clusterer: any) => (
              <>
                {filteredRestaurants.map((r: Restaurant) => {
                  const key = r._id && r._id !== '' ? r._id : `${r.profile?.name || 'unknown'}-${getRestaurantCoordinateKey(r)}`;
                  return (
                    <OptimizedMarker
                      key={key}
                      restaurant={r}
                      isSelected={selectedId === r._id}
                      onClick={() => setSelected(r._id)}
                      clusterer={clusterer}
                    />
                  );
                })}

                <UserLocationMarker coords={coords} />
              </>
            )}
          </MarkerClusterer>
        ) : (
          <>
            {filteredRestaurants.map((r: Restaurant) => {
              const key = r._id && r._id !== '' ? r._id : `${r.profile?.name || 'unknown'}-${getRestaurantCoordinateKey(r)}`;
              return (
                <OptimizedMarker
                  key={key}
                  restaurant={r}
                  isSelected={selectedId === r._id}
                  onClick={() => setSelected(r._id)}
                />
              );
            })}

            <UserLocationMarker coords={coords} />
          </>
        )}
      </GoogleMap>

      {/* Premium Search Bar */}
      <PremiumSearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        placeholder="Find restaurants by name, cuisine, or city..."
      />

      {/* Map overlay with stats */}
      <MapOverlay
        restaurantCount={filteredRestaurants.length}
        nearbyCount={nearbyCount}
        isLoading={loading}
      />

      {/* Show Near Me button */}
      <SeeNearMeButton
        onClick={handleSeeNearMe}
        title="Show Near Me"
        loading={internalLoading}
      />

      {/* Floating Control Bar */}
      <FloatingControlBar
        controls={[
          {
            icon: <Layers className="w-5 h-5" />,
            label: 'Clusters',
            onClick: () => setShowClusters(!showClusters),
            tooltip: showClusters ? 'Disable marker clustering' : 'Enable marker clustering',
            variant: 'secondary',
            isActive: showClusters,
          },
          {
            icon: <RotateCcw className="w-5 h-5" />,
            label: 'Reset',
            onClick: handleReset,
            tooltip: 'Reset filters and view',
            variant: 'secondary',
          },
        ]}
        position="bottom-right"
        compact={false}
      />

      {/* Restaurant card overlay */}
      <AnimatePresence>
        {selectedId && filteredRestaurants.some((restaurant) => restaurant._id === selectedId) && (
          <RestaurantCard
            key={selectedId} // Added key prop here
            restaurant={filteredRestaurants.find((r) => r._id === selectedId)!}
            onClick={() => navigate(`/dashboard?tab=discover&restaurantId=${selectedId}`)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {!loading && filteredRestaurants.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 text-center max-w-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Restaurants Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchQuery || filters.distance !== 'all' || filters.price !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No restaurants available in this area'}
              </p>
              {(searchQuery || filters.distance !== 'all' || filters.price !== 'all') && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors pointer-events-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global loading overlay */}
      <LoadingOverlay show={internalLoading || loading} />
    </motion.div>
  );
}
