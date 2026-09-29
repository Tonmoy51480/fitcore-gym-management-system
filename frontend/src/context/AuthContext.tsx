import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { LoginResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitcore_user') || localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fitcore_token') || localStorage.getItem('aura_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem('fitcore_token') || localStorage.getItem('aura_token');
      if (savedToken) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          localStorage.setItem('fitcore_user', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setIsLoading(false);
    }
    verifyAuth();
  }, []);

  const login = (data: LoginResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('fitcore_token', data.token);
    localStorage.setItem('fitcore_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fitcore_token');
    localStorage.removeItem('fitcore_user');
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('fitcore_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
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
