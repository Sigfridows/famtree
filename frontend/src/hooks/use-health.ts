'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export function useHealth() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loading, setLoading] = useState(true);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setStatus('checking');
    try {
      await apiClient.get('/health');
      setStatus('online');
    } catch {
      setStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkHealth(); }, [checkHealth]);

  return { status, loading, refetch: checkHealth };
}