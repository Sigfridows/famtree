'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface UserProfile {
  codigo_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol?: string;
  avatar_url?: string;
  fecha_creacion?: string;
}

export interface UpdateUserInput {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  avatar_url?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get<UserProfile>('/users/me');
      setUser(data);
      setError(null);
    } catch (err: unknown) {
      setUser(null);
      const message = err instanceof Error ? err.message : 'Error al obtener el perfil de usuario';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isMounted) {
        void fetchUser();
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchUser]);

  const updateUser = async (input: UpdateUserInput) => {
    setUpdating(true);
    setError(null);
    try {
      const { data } = await apiClient.patch<UserProfile>('/users/me', input);
      setUser(data);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      setError(message);
      throw new Error(message);
    } finally {
      setUpdating(false);
    }
  };

  const refetch = () => {
    setLoading(true);
    setError(null);
    void fetchUser();
  };

  return {
    user,
    loading,
    updating,
    error,
    isAuthenticated: !!user,
    updateUser,
    refetch,
  };
}