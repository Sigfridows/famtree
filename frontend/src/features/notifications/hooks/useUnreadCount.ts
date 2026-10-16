"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationsApi } from "../api/notificationsService";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useUnreadCount() {
  const requestVersion = useRef(0);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUnreadCount = useCallback(async () => {
    const version = ++requestVersion.current;
    if (!isAuthenticated) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const unread = await notificationsApi.getUnreadCount();
      if (version === requestVersion.current) setCount(unread);
    } catch {
      // Manejo silencioso
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      queueMicrotask(() => {
        void fetchUnreadCount();
      });
    }
  }, [fetchUnreadCount, isAuthenticated, isAuthLoading]);

  return { count: isAuthenticated ? count : 0, loading: loading || isAuthLoading, refetchCount: fetchUnreadCount };
}