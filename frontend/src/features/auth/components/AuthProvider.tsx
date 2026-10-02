'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, LoginCredentials, RegisterData } from '../types';
import { authApi } from '../api/authApi';
import { ApiError } from '@/lib/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
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
    await authApi.register(data);
    try {
      return await login({ username: data.username, password: data.password });
    } catch {
      throw new ApiError("Tu cuenta ya fue creada. Ve a Inicia Sesión para entrar con tu usuario y contraseña.", 401, "registration_login_failed");
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};