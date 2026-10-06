import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('clm_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.verifyAuth();
          if (res.authenticated) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Auth verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.token) {
      localStorage.setItem('clm_admin_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error('Authentication failed');
  };

  const logout = async () => {
    try {
      if (token) await api.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('clm_admin_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
