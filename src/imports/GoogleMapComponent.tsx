import { useCallback, useMemo, useRef, memo, Fragment } from 'react';
import { useLoadScript, GoogleMap, Marker, MarkerClusterer } from '@react-google-maps/api';
import type { Restaurant } from '@/types/Restaurant';
import { createMarkerUrl } from './MapMarker';
import { MAP_THEME } from '@/constants/mapTheme';

type Location = { lat: number; lng: number };

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

function getRestaurantCoordinates(restaurant: Restaurant): Location | null {
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

const containerStyle = {
  width: '100%',
  height: '100%',
} as const;

const DEFAULT_CENTER: Location = { lat: 41.3851, lng: 2.1734 };
const DEFAULT_ZOOM = 13;

interface GoogleMapComponentProps {
  restaurants: Restaurant[];
  selectedRestaurantId?: string | null;
  onRestaurantSelect?: (restaurantId: string) => void;
  center?: Location;
  zoom?: number;
  showClusters?: boolean;
  userLocation?: Location | null;
  isLoading?: boolean;
  onMapLoad?: (map: google.maps.Map) => void;
  mapStyle?: any[];
}

/**
 * Optimized restaurant marker component
 * Only re-renders when selection state or restaurant ID changes
 */
interface RestaurantMarkerProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
  clusterer?: any;
}

const RestaurantMarker = memo<RestaurantMarkerProps>(
  function RestaurantMarker({ restaurant, isSelected, onClick, clusterer }) {
    const coords = getRestaurantCoordinates(restaurant);

    const isNearby = (restaurant as any).isNearby;
    const markerColor = isNearby ? MAP_THEME.accent : MAP_THEME.primary;

    // Memoize marker URL to avoid regenerating on every render
    const markerUrl = useMemo(() => createMarkerUrl(markerColor, 36, isSelected, isNearby), [markerColor, isSelected, isNearby]);

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
        title={restaurant.profile?.name || 'Restaurant'}
        clusterer={clusterer}
      />
    );
  },
  (prevProps, nextProps) => {
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

RestaurantMarker.displayName = 'RestaurantMarker';

/**
 * User location marker component
 */
interface UserLocationMarkerProps {
  coords?: Location | null | undefined;
}

const UserLocationMarker = memo<UserLocationMarkerProps>(({ coords }) => {
  if (!coords) return null;

  return (
    <Marker
      position={{ lat: coords.lat, lng: coords.lng }}
      icon={{
        url: createMarkerUrl(MAP_THEME.accent, 28, false, false),
        scaledSize: new (window as any).google.maps.Size(28, 28),
        anchor: new (window as any).google.maps.Point(14, 14),
      }}
      clickable={false}
      title="Your Location"
    />
  );
});

UserLocationMarker.displayName = 'UserLocationMarker';

/**
 * GoogleMapComponent - A reusable Google Maps component showing restaurant markers
 *
 * Features:
 * - Displays restaurant markers on a Google Map
 * - Optional marker clustering for better performance with many markers
 * - User location marker support
 * - Restaurant selection/highlighting
 * - Customizable center, zoom, and styling
 * - Performance optimized with memoization
 *
 * @example
 * ```tsx
 * <GoogleMapComponent
 *   restaurants={restaurants}
 *   onRestaurantSelect={(id) => console.log('Selected:', id)}
 *   showClusters={true}
 *   userLocation={userCoords}
 * />
 * ```
 */
const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantSelect,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  showClusters = true,
  userLocation,
  onMapLoad,
  mapStyle = [],
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      onMapLoad?.(map);
    },
    [onMapLoad]
  );

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-lg font-semibold text-gray-900">Unable to Load Maps</h1>
          <p className="text-sm text-gray-600">Please check your API key and internet connection</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const handleMarkerClick = (restaurantId: string) => {
    onRestaurantSelect?.(restaurantId);
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: (window as any).google?.maps?.ControlPosition?.RIGHT_BOTTOM,
        },
        styles: mapStyle,
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
      onLoad={handleMapLoad}
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
                  background: MAP_THEME.cluster,
                  borderRadius: '50%',
                  lineHeight: '53px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 10px 30px ${MAP_THEME.clusterShadow}`,
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                },
              ] as any,
            }}
            // provide children explicitly to satisfy typings
            children={(clusterer: any) => (
              <>
                    {restaurants.map((restaurant) => {
                      const restaurantId = restaurant._id;
                      if (!restaurantId) return null;

                      return (
                      <Fragment key={restaurantId}>
                        <RestaurantMarker
                          restaurant={restaurant}
                          isSelected={selectedRestaurantId === restaurant._id}
                          onClick={() => handleMarkerClick(restaurantId)}
                          clusterer={clusterer}
                        />
                      </Fragment>
                      );
                    })}
                <UserLocationMarker coords={userLocation} />
              </>
            )}
          />
      ) : (
        <>
          {restaurants.map((restaurant) => {
            const restaurantId = restaurant._id;
            if (!restaurantId) return null;

            return (
              <Fragment key={restaurantId}>
                <RestaurantMarker
                  restaurant={restaurant}
                  isSelected={selectedRestaurantId === restaurant._id}
                  onClick={() => handleMarkerClick(restaurantId)}
                />
              </Fragment>
            );
          })}
          <UserLocationMarker coords={userLocation} />
        </>
      )}
    </GoogleMap>
  );
};

GoogleMapComponent.displayName = 'GoogleMapComponent';

export default GoogleMapComponent;
export { type GoogleMapComponentProps, DEFAULT_CENTER, DEFAULT_ZOOM };

