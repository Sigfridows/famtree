import { apiClient } from "@/lib/apiClient";
import { User, UserStatus } from "@/types";

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  profilePicture?: string | null;
  description?: string | null;
}

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },

  updateProfile: async (payload: UpdateUserPayload): Promise<User> => {
    const response = await apiClient.patch<User>("/users/me", payload);
    return response.data;
  },

  updateUserStatus: async (id: number, status: UserStatus): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/status`, { status });
    return response.data;
  },
};