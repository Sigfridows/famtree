"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationsService } from "../api/notificationsService";

export function useUnreadCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const unread = await notificationsService.getUnreadCount();
      setCount(unread);
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let isMounted = true;

  const init = async () => {
    if (isMounted) {
      await fetchUnreadCount();
    }
  };

  void init();

  return () => {
    isMounted = false;
  };
}, [fetchUnreadCount]);

  return { count, loading, refetchCount: fetchUnreadCount };
}