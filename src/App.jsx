import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeCustomer from './pages/dashboard/HomeCustomer';
import HomeEmployee from './pages/dashboard/HomeEmployee';

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div className="loading-screen"><span className="btn-spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}

// ─── Public Route ─────────────────────────────────────────────────────────────
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// ─── Dashboard Dispatcher ─────────────────────────────────────────────────────
function DashboardDispatcher() {
  const { role } = useAuth();
  if (role === 'customer') return <Navigate to="/dashboard/customer" replace />;
  if (role === 'owner' || role === 'staff') return <Navigate to="/dashboard/employee" replace />;
  return <Navigate to="/login" replace />;
}

// ─── App Component ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardDispatcher /></ProtectedRoute>} />
          
          <Route 
            path="/dashboard/customer" 
            element={<ProtectedRoute allowedRoles={['customer']}><HomeCustomer /></ProtectedRoute>} 
          />
          
          <Route 
            path="/dashboard/employee" 
            element={<ProtectedRoute allowedRoles={['owner', 'staff']}><HomeEmployee /></ProtectedRoute>} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
