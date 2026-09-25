"use client";

import { useState, useEffect, useCallback } from "react";
import { profileService } from "../api/profileService";
import type { User, UpdateProfilePayload } from "../types/profile.types";

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: unknown) {
      setProfile(null);
      const message = err instanceof Error ? err.message : "Error al obtener el perfil";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let isMounted = true;

  const init = async () => {
    if (isMounted) {
      await fetchProfile();
    }
  };

  void init();

  return () => {
    isMounted = false;
  };
}, [fetchProfile]);

  const updateProfile = async (payload: UpdateProfilePayload) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al actualizar el perfil";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setSaving(true);
      setError(null);
      const { url } = await profileService.uploadAvatar(file);
      if (profile) {
        setProfile({ ...profile, profilePicture: url });
      }
      return url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al subir la imagen";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    user: profile, // Alias
    loading,
    saving,
    updating: saving, // Alias
    error,
    isAuthenticated: !!profile,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}

// Alias de compatibilidad
export const useUser = useProfile;