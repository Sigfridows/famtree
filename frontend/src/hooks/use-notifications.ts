'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface NotificationItem {
  codigo_notificacion: number;
  mensaje?: string;
  leida?: boolean;
  fecha_creacion?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ items?: NotificationItem[] } | NotificationItem[]>('/notifications');
      const items = Array.isArray(data) ? data : data.items || [];
      setNotifications(items);
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isMounted) {
        void fetchNotifications();
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchNotifications]);

  const markAsRead = async (codigoNotificacion: number) => {
    const previous = [...notifications];
    setNotifications((prev) =>
      prev.map((n) => (n.codigo_notificacion === codigoNotificacion ? { ...n, leida: true } : n))
    );
    try {
      await apiClient.patch(`/notifications/${codigoNotificacion}/read`);
    } catch {
      setNotifications(previous);
    }
  };

  const refetch = () => {
    setLoading(true);
    void fetchNotifications();
  };

  return { notifications, loading, markAsRead, refetch };
}