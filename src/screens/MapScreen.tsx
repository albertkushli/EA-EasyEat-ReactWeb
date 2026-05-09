import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLoadScript, GoogleMap, Marker, MarkerClusterer } from '@react-google-maps/api';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useLocationStore } from '@/stores/locationStore';
import RestaurantCard from '@/components/RestaurantCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import SeeNearMeButton from '@/components/SeeNearMeButton';
import { AnimatePresence } from 'framer-motion';
import type { Restaurant } from '@/types/Restaurant';
import { useNavigate, useLocation } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '100%'
} as const;

const DEFAULT_CENTER = { lat: 41.3851, lng: 2.1734 };

function makeSvgDataUrl(color: string) {
  const svg = encodeURIComponent(`<?xml version="1.0"?><svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24'><path fill='${color}' d='M12 2C8 2 5 5 5 9c0 5 6 11 6 11s6-6 6-11c0-4-3-7-7-7z'/></svg>`);
  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}

function getRestaurantCoordinates(restaurant: Restaurant) {
  const coords = restaurant.profile?.location?.coordinates?.coordinates;

  if (!Array.isArray(coords) || coords.length < 2) return null;

  const [lng, lat] = coords;
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return { lat, lng };
}

export default function MapScreen() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string || ''
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

  const restaurants = useRestaurantStore((s: any) => s.restaurants as Restaurant[]);
  const loadRestaurants = useRestaurantStore((s: any) => s.loadRestaurants as () => Promise<void>);
  const loadNearby = useRestaurantStore((s: any) => s.loadNearby as (lat: number, lng: number) => Promise<void>);
  const selectedId = useRestaurantStore((s: any) => s.selectedId as string | undefined | null);
  const setSelected = useRestaurantStore((s: any) => s.setSelected as (id?: string | null) => void);

  const { coords, requestLocation } = useLocationStore();
  const [internalLoading, setInternalLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  useEffect(() => {
    // If navigated with state to open a specific restaurant
    const state = (location.state as any) || {};
    if (state.openRestaurantId) {
      setTimeout(() => {
        setSelected(state.openRestaurantId);
        const r = (restaurants as Restaurant[]).find((x) => x._id === state.openRestaurantId);
        const coords = r ? getRestaurantCoordinates(r) : null;
        if (coords && mapRef.current) {
          mapRef.current.panTo(coords);
        }
      }, 300);
    }
  }, [location.state, restaurants, setSelected]);

  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.panTo({ lat: coords.lat, lng: coords.lng });
      mapRef.current.setZoom(15);
    }
  }, [coords]);

  const handleSeeNearMe = async () => {
    setInternalLoading(true);
    await requestLocation();
    if (useLocationStore.getState().coords) {
      const c = useLocationStore.getState().coords!;
      await loadNearby(c.lat, c.lng);
      if (mapRef.current) mapRef.current.panTo({ lat: c.lat, lng: c.lng });
    }
    setInternalLoading(false);
  };

  const center = useMemo(() => (coords ? { lat: coords.lat, lng: coords.lng } : DEFAULT_CENTER), [coords]);

  if (loadError) return <div className="p-4">Error loading maps</div>;
  if (!isLoaded) return <LoadingOverlay show />;

  return (
    <div className="h-screen w-full relative bg-gray-100">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={{ fullscreenControl: false, mapTypeControl: false, streetViewControl: false, styles: [] }}
        onLoad={onMapLoad}
      >
        <MarkerClusterer>
          {(clusterer: any) => (
            <>
              {restaurants.map((r: Restaurant) => {
                const coords = getRestaurantCoordinates(r);
                if (!coords) return null;

                return (
                  <Marker
                    key={r._id}
                    position={coords}
                    clusterer={clusterer}
                    onClick={() => setSelected(r._id)}
                    icon={{ url: makeSvgDataUrl((r as any).isNearby ? '#ff9800' : '#e53935'), scaledSize: new (window as any).google.maps.Size(36, 36) }}
                  />
                );
              })}

              {coords && (
                <Marker
                  position={{ lat: coords.lat, lng: coords.lng }}
                  icon={{ url: makeSvgDataUrl('#3b82f6'), scaledSize: new (window as any).google.maps.Size(28, 28) }}
                  clickable={false}
                />
              )}
            </>
          )}
        </MarkerClusterer>
      </GoogleMap>

      <SeeNearMeButton onClick={handleSeeNearMe} />

      <AnimatePresence>
        {selectedId && restaurants.some((restaurant) => restaurant._id === selectedId) && (
          <div className="fixed left-0 right-0 bottom-0 z-50 pointer-events-auto">
            <RestaurantCard
              restaurant={(restaurants as Restaurant[]).find((r) => r._id === selectedId)!}
              onClick={() => navigate(`/restaurant/${selectedId}`)}
            />
          </div>
        )}
      </AnimatePresence>

      <LoadingOverlay show={internalLoading} />
    </div>
  );
}

