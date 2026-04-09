import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null); // { accessToken, user }
  const [loading, setLoading] = useState(true);

  // ─── Silent Refresh ─────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for httpOnly cookie
      });

      if (res.ok) {
        const data = await res.json();
        setAuth({ accessToken: data.accessToken, user: data.user });
        return data.accessToken;
      } else {
        setAuth(null);
        return null;
      }
    } catch {
      setAuth(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Check
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
    };
    initAuth();
  }, [refreshSession]);

  const login = useCallback((accessToken, user) => {
    setAuth({ accessToken, user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
    } finally {
      setAuth(null);
    }
  }, []);

  const isAuthenticated = Boolean(auth?.accessToken);
  const role            = auth?.user?.role ?? null;
  const user            = auth?.user ?? null;
  const token           = auth?.accessToken ?? null;

  return (
    <AuthContext.Provider value={{ auth, user, token, login, logout, refreshSession, isAuthenticated, role, loading }}>
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
