import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { loginUser, logoutUser } from '@/features/auth/services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_data');
      if (stored) return JSON.parse(stored);

      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      if (!token || !userRaw) return null;

      return { accessToken: token, user: JSON.parse(userRaw) };
    } catch { return null; }
  });
  const [restaurant, setRestaurant] = useState(() => {
    try {
      const stored = localStorage.getItem('restaurant_data');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Persist auth state to localStorage
  useEffect(() => {
    if (auth) localStorage.setItem('auth_data', JSON.stringify(auth));
    else localStorage.removeItem('auth_data');
  }, [auth]);

  // Persist restaurant state to localStorage
  useEffect(() => {
    if (restaurant) localStorage.setItem('restaurant_data', JSON.stringify(restaurant));
    else localStorage.removeItem('restaurant_data');
  }, [restaurant]);


  // ─── Silent Refresh ─────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    try {
      // Instead of relying on the backend /auth/refresh stub which currently returns 401,
      // we rely on the localStorage data which we initialized above.
      if (auth?.accessToken) {
        return auth.accessToken;
      }
      return null;
    } catch {
      setAuth(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(auth?.accessToken);
  const role = auth?.user?.role ?? null;
  const user = auth?.user ?? null;
  const token = auth?.accessToken ?? null;

  // Initial Check (silent refresh)
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
    };
    initAuth();
  }, [refreshSession]);

  // Fetch Restaurant Data if authenticated as employee
  useEffect(() => {
    async function fetchRestaurant() {
      if ((role === 'owner' || role === 'staff') && user?.restaurant_id && !restaurant) {
        try {
          console.log('🔄 Fetching FULL restaurant data for:', user.restaurant_id);
          const res = await apiClient.get(`/restaurants/${user.restaurant_id}/full`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.status === 200) {
            setRestaurant(res.data);
            console.log('📍 Full restaurant data loaded:', res.data.profile?.name);
          }
        } catch (err) {
          console.error('❌ Failed to load restaurant:', err);
        }
      }
    }
    
    // Only fetch if we are not loading the initial session
    if (!loading) {
      fetchRestaurant();
    }
  }, [user?.restaurant_id, role, restaurant, loading]);

  const login = useCallback(async (email, password, userType = 'customer') => {
    try {
      const { token, user } = await loginUser(email, password, userType);
      setAuth({ accessToken: token, user });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error?.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      // 1. Create the customer using the existing backend endpoint
      const res = await apiClient.post('/customers', userData);

      if (res.status === 201) {
        // 2. Perform auto-login using the credentials provided during registration
        return await login(userData.email, userData.password, 'customer');
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      // Optional: notify backend we're logging out - suppress API error logs for this call
      await apiClient.post('/auth/logout', {}, { headers: { 'X-Suppress-Error-Log': '1' } }).catch(() => {});
    } finally {
      setAuth(null);
      setRestaurant(null);
      logoutUser();
    }
  }, []);


  return (
    <AuthContext.Provider value={{
      auth,
      user,
      token,
      login,
      register,
      logout,
      refreshSession,
      isAuthenticated,
      role,
      loading,
      restaurant
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

