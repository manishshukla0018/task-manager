import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { setStoredToken, clearStoredToken } from '../utils/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.data);
    } catch {
      setUser(null);
      clearStoredToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const persistSession = (payload) => {
    const { token, ...rest } = payload || {};
    if (token) setStoredToken(token);
    setUser(rest);
    return rest;
  };

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);

     console.log("LOGIN RESPONSE:", data);
     
    return persistSession(data.data);
  };

  const signup = async (formData) => {
    const { data } = await authService.signup(formData);
    return persistSession(data.data);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearStoredToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isAdmin: user?.role === 'Admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
