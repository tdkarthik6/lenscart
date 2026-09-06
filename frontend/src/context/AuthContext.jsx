import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('lenscraft_token');
    const savedUser  = localStorage.getItem('lenscraft_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const _persist = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('lenscraft_token', jwt);
    localStorage.setItem('lenscraft_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: u, token: t } = res.data.data;
    _persist(u, t);
    return u;
  };

  const ownerLogin = async (email, password) => {
    const res = await authApi.ownerLogin({ email, password });
    const { user: u, token: t } = res.data.data;
    _persist(u, t);
    return u;
  };

  const register = async (name, email, phone, password) => {
    const res = await authApi.register({ name, email, phone, password });
    const { user: u, token: t } = res.data.data;
    _persist(u, t);
    return u;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lenscraft_token');
    localStorage.removeItem('lenscraft_user');
  };

  const isOwner    = user?.role === 'OWNER';
  const isCustomer = user?.role === 'CUSTOMER';
  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isOwner, isCustomer, isLoggedIn, login, ownerLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
