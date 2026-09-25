import { apiClient } from "@/lib/apiClient";
import type { User, UserStatus, UpdateProfilePayload } from "../types/profile.types";

export const profileService = {
  // Perfil propio
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await apiClient.patch<User>("/users/me", payload);
    return data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<{ url: string }>("/users/me/avatar", formData);
    return data;
  },

  // Gestión de usuarios (Admin)
  getUserById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  getUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>("/users");
    return data;
  },

  updateUserStatus: async (id: number, status: UserStatus): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}/status`, { status });
    return data;
  },
};

// Alias por compatibilidad
export const userService = profileService;