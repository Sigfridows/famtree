"use client";

import { useState, useEffect, useCallback } from "react";
import { centerAdminService } from "../api/centerAdminService";
import { CenterInfo, UpdateCenterPayload } from "../types/centerAdmin.types";

export function useCenterAdmin() {
  const [center, setCenter] = useState<CenterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenterData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await centerAdminService.getMyCenterInfo();
      setCenter(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar la información del centro";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let isMounted = true;

  const init = async () => {
    if (isMounted) {
      await fetchCenterData();
    }
  };

  void init();

  return () => {
    isMounted = false;
  };
}, [fetchCenterData]);

  const updateInfo = async (payload: UpdateCenterPayload) => {
    setSaving(true);
    try {
      const updated = await centerAdminService.updateCenterInfo(payload);
      setCenter(updated);
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar los cambios";
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  return { center, loading, saving, error, updateInfo, refetch: fetchCenterData };
}