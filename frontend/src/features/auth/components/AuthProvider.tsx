'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, LoginCredentials, RegisterData } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  register: (data: RegisterData) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await authApi.getSession();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  let isMounted = true;

  const init = async () => {
    if (isMounted) {
      await refreshSession();
    }
  };

  void init();

  return () => {
    isMounted = false;
  };
}, [refreshSession]);

  const login = async (credentials: LoginCredentials) => {
    const userData = await authApi.login(credentials);
    setUser(userData);
    return userData;
  };

  const register = async (data: RegisterData) => {
    const userData = await authApi.register(data);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};