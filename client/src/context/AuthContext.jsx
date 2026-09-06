import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('medicare_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.data.doctor);
        }
      } catch (err) {
        localStorage.removeItem('medicare_token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      const { token, doctor } = data.data;
      localStorage.setItem('medicare_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(doctor);
      return doctor;
    }
    throw new Error(data.message || 'Login failed');
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    if (data.success) {
      const { token, doctor } = data.data;
      localStorage.setItem('medicare_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(doctor);
      return doctor;
    }
    throw new Error(data.message || 'Registration failed');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // ignore
    }
    localStorage.removeItem('medicare_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedDoctor) => {
    setUser((prev) => ({ ...prev, ...updatedDoctor }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
