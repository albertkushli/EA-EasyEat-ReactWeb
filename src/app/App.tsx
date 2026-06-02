import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import { Login, Register } from '@/features/auth';
import { Dashboard, Home } from '@/features/dashboard';
import { Clients } from '@/features/customers';
import MapScreen from '@/screens/MapScreen';
import DiscoverScreen from '@/screens/DiscoverScreen';
import LegalNotice from '@/features/legal/LegalNotice';
import MatomoTracker from '@/components/MatomoTracker';

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
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <MatomoTracker />
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
          <Route path="/map" element={<MapScreen />} />
          <Route path="/restaurant/:id" element={<div className="p-4">Restaurant details placeholder</div>} />

          <Route path="/aviso-legal" element={<LegalNotice />} />
        </Routes>
      </Router>
      </ChatProvider>
    </AuthProvider>
  );
}