// src/features/profile/api/profileService.ts

import { apiClient } from "@/lib/apiClient";
import { getImageUrl } from "@/lib/utils";
import type { User, UserStatus, UpdateProfilePayload } from "../types/profile.types";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const profileService = {
  // Perfil propio
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>("/users/me");
    return {
      ...data,
      profilePicture: getImageUrl(data.profilePicture),
    };
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const {...cleanPayload } = payload as Record<string, unknown>;

    if (typeof cleanPayload.phone === "string") {
      const digitsOnly = cleanPayload.phone.replace(/\D/g, "");
      cleanPayload.phone = digitsOnly.length > 0 ? digitsOnly : null;
    }

    const { data } = await apiClient.patch<User>("/users/me", cleanPayload);

    return {
      ...data,
      profilePicture: getImageUrl(data.profilePicture),
    };
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<User>("/users/me/picture", formData);

    return {
      url: getImageUrl(data.profilePicture),
    };
  },

  // Cambiar contraseña
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.post("/auth/change-password", payload);
  },

  // Gestión de usuarios (Admin)
  getUserById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return {
      ...data,
      profilePicture: getImageUrl(data.profilePicture),
    };
  },

  getUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>("/users");
    return data.map((user) => ({
      ...user,
      profilePicture: getImageUrl(user.profilePicture),
    }));
  },

  updateUserStatus: async (id: number, status: UserStatus): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}/status`, { status });
    return {
      ...data,
      profilePicture: getImageUrl(data.profilePicture),
    };
  },
};

export const userService = profileService;