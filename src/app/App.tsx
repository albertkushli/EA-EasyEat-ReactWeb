import { useCallback, useEffect, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import { Login, Register } from '@/features/auth';
import { Dashboard, Home } from '@/features/dashboard';
import { Clients } from '@/features/customers';
import DiscoverScreen from '@/screens/DiscoverScreen';
import LegalNotice from '@/features/legal/LegalNotice';
import MapScreenPremium from '@/imports/MapScreenPremium';
import { useLocationStore } from '@/stores/locationStore';
import { useRestaurantStore } from '@/stores/restaurantStore';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

export default function App() {
  function MapRouteWrapper() {
    const location = useLocation();
    const loadRestaurants = useRestaurantStore((s: any) => s.loadRestaurants);
    const loadNearby = useRestaurantStore((s: any) => s.loadNearby);
    const restaurants = useRestaurantStore((s: any) => s.restaurants);
    const loading = useRestaurantStore((s: any) => s.loading);
    const coords = useLocationStore((s) => s.coords);
    const requestLocation = useLocationStore((s) => s.requestLocation);
    const state: any = (location && (location.state as any)) || {};

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

    return (
      <MapScreenPremium
        restaurants={restaurants}
        userLocation={coords}
        isLoading={loading}
        initialSelectedRestaurantId={state.openRestaurantId}
        onRequestNearby={handleRequestNearby}
      />
    );
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
        <Routes>
          <Route
            path="/"
            element={(
              <PublicRoute>
                <Home />
              </PublicRoute>
            )}
          />

          <Route
            path="/login"
            element={(
              <PublicRoute>
                <Login />
              </PublicRoute>
            )}
          />

          <Route
            path="/register"
            element={(
              <PublicRoute>
                <Register />
              </PublicRoute>
            )}
          />

          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          >
            <Route path="clients" element={<Clients />} />
          </Route>
           <Route path="/discover" element={<DiscoverScreen />} />
           <Route path="/restaurant/:id" element={<div className="p-4">Restaurant details placeholder</div>} />

          <Route path="/map" element={<MapRouteWrapper />} />
          <Route path="/aviso-legal" element={<LegalNotice />} />
        </Routes>
      </Router>
      </ChatProvider>
    </AuthProvider>
  );
}