import { useState, useEffect } from 'react';
import GoogleMapComponent, { DEFAULT_CENTER } from './GoogleMapComponent';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useLocationStore } from '../stores/locationStore';
import { MODERN_MAP_STYLE } from '../utils/mapStyles';
import type { Restaurant } from '../types/Restaurant';

/**
 * SimpleGoogleMapExample - A basic example of using the GoogleMapComponent
 *
 * This component demonstrates:
 * - Loading restaurant data
 * - Displaying markers on a Google Map
 * - User location support
 * - Restaurant selection
 */
const SimpleGoogleMapExample: React.FC = () => {
  const restaurants = useRestaurantStore((s: any) => s.restaurants as Restaurant[]);
  const loading = useRestaurantStore((s: any) => s.loading as boolean);
  const loadRestaurants = useRestaurantStore((s: any) => s.loadRestaurants as () => Promise<void>);

  const coords = useLocationStore((s) => s.coords);
  const requestLocation = useLocationStore((s) => s.requestLocation);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showClusters, setShowClusters] = useState(true);

  // Load restaurants on mount
  useEffect(() => {
    loadRestaurants();
    requestLocation();
  }, [loadRestaurants, requestLocation]);

  return (
    <div className="w-full h-screen flex flex-col relative">
      {/* Map */}
      <div className="flex-1">
        <GoogleMapComponent
          restaurants={restaurants}
          selectedRestaurantId={selectedId}
          onRestaurantSelect={setSelectedId}
          center={coords ? { lat: coords.lat, lng: coords.lng } : DEFAULT_CENTER}
          zoom={13}
          showClusters={showClusters}
          userLocation={coords}
          isLoading={loading}
          mapStyle={MODERN_MAP_STYLE}
        />
      </div>

      {/* Simple Controls */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-10">
        <button
          onClick={() => setShowClusters(!showClusters)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showClusters
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-900 border border-gray-300'
          }`}
        >
          {showClusters ? 'Clustering On' : 'Clustering Off'}
        </button>
      </div>

      {/* Restaurant Info */}
      {selectedId && restaurants.filter((r) => r._id === selectedId).length > 0 && (
        <div className="absolute bottom-8 left-8 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
          {(() => {
            const restaurant = restaurants.filter((r) => r._id === selectedId)[0];
            return (
              <>
                <h3 className="font-bold text-lg">{restaurant?.profile?.name}</h3>
                <p className="text-sm text-gray-600">{restaurant?.profile?.category?.join(', ')}</p>
                <p className="text-sm text-gray-700 mt-2">{restaurant?.profile?.description}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ⭐ {restaurant?.profile?.globalRating}
                  </span>
                  {restaurant?.distanceKm && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      📍 {restaurant.distanceKm} km
                    </span>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default SimpleGoogleMapExample;

