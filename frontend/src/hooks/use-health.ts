'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export function useHealth() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loading, setLoading] = useState(true);

  const checkHealth = useCallback(async () => {
    try {
      await apiClient.get('/health');
      setStatus('online');
    } catch {
      setStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await Promise.resolve();
      if (isMounted) {
        void checkHealth();
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [checkHealth]);

  const refetch = () => {
    setLoading(true);
    setStatus('checking');
    void checkHealth();
  };

  return { status, loading, refetch };
}