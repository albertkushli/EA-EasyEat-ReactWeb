import { createContext, useContext, useState, useCallback, useEffect, ReactNode, FC } from 'react';
import apiClient from '../lib/apiClient';
import { IAuthState, IUser, IRestaurant, UserRole } from '../types';
import { restaurantService } from '../services';
import { STORAGE_KEYS, USER_ROLES } from '../constants';

interface AuthContextType {
  auth: IAuthState | null;
  user: IUser | null;
  token: string | null;
  login: (email: string, password: string, userType?: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  updateUser: (updatedUserFields: Partial<IUser>) => void;
  isAuthenticated: boolean;
  role: UserRole | null;
  loading: boolean;
  restaurant: IRestaurant | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<IAuthState | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESTAURANT_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Persist auth state to localStorage
  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
  }, [auth]);

  // Persist restaurant state to localStorage
  useEffect(() => {
    if (restaurant) localStorage.setItem(STORAGE_KEYS.RESTAURANT_DATA, JSON.stringify(restaurant));
    else localStorage.removeItem(STORAGE_KEYS.RESTAURANT_DATA);
  }, [restaurant]);

  // ─── Silent Refresh ─────────────────────────────────────────────────────────
  const refreshSession = useCallback(async (): Promise<string | null> => {
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
  }, [auth?.accessToken]);

  const isAuthenticated = Boolean(auth?.accessToken);
  const role: UserRole | null = (auth?.user?.role as UserRole) ?? null;
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
      if (
        (role === USER_ROLES.OWNER || role === USER_ROLES.STAFF) &&
        user?.restaurant_id &&
        !restaurant
      ) {
        try {
          console.log('🔄 Fetching FULL restaurant data for:', user.restaurant_id);
          const restaurantData = await restaurantService.fetchRestaurantFull(user.restaurant_id);
          if (restaurantData) {
            setRestaurant(restaurantData);
            console.log('📍 Full restaurant data loaded:', restaurantData.profile?.name);
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

  const login = useCallback(
    async (email: string, password: string, userType: string = 'customer') => {
      try {
        const res = await apiClient.post('/auth/login', { email, password, role: userType });

        if (res.status === 200) {
          const { accessToken } = res.data;
          const userPayload = res.data.customer || res.data.employee || res.data.admin;
          setAuth({ accessToken, user: userPayload });
          // Restaurant data will be fetched by the useEffect above

          return { success: true };
        }
      } catch (error: any) {
        console.error('Login error:', error);
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed',
        };
      }
    },
    []
  );

  const register = useCallback(
    async (userData: any) => {
      try {
        // 1. Create the customer using the existing backend endpoint
        const res = await apiClient.post('/customers', userData);

        if (res.status === 201) {
          // 2. Perform auto-login using the credentials provided during registration
          return await login(userData.email, userData.password, 'customer');
        }
      } catch (error: any) {
        console.error('Register error:', error);
        return {
          success: false,
          error: error.response?.data?.message || 'Registration failed',
        };
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      // Optional: notify backend we're logging out
      await apiClient.post('/auth/logout', {}).catch(() => {});
    } finally {
      setAuth(null);
      setRestaurant(null);
      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      localStorage.removeItem(STORAGE_KEYS.RESTAURANT_DATA);
    }
  }, []);

  const updateUser = useCallback((updatedUserFields: Partial<IUser>) => {
    setAuth((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        user: { ...prev.user, ...updatedUserFields },
      };
    });
  }, []);

  const value: AuthContextType = {
    auth,
    user,
    token,
    login,
    register,
    logout,
    refreshSession,
    updateUser,
    isAuthenticated,
    role,
    loading,
    restaurant,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
