'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data.items || data);
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

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

  return { notifications, loading, markAsRead, refetch: fetchNotifications };
}