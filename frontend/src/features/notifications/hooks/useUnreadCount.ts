"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationsApi } from "../api/notificationsService";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useUnreadCount() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const unread = await notificationsApi.getUnreadCount();
      setCount(unread);
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      queueMicrotask(() => {
        void fetchUnreadCount();
      });
    }
  }, [fetchUnreadCount, isAuthenticated, isAuthLoading]);

  return { count, loading: loading || isAuthLoading, refetchCount: fetchUnreadCount };
}