import { apiClient } from "@/lib/apiClient";
import { Notification, NotificationPreference } from "@/types";

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>("/notifications");
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },

  getPreferences: async (): Promise<NotificationPreference> => {
    const response = await apiClient.get<NotificationPreference>("/notifications/preferences");
    return response.data;
  },

  updatePreferences: async (
    payload: Partial<NotificationPreference>
  ): Promise<NotificationPreference> => {
    const response = await apiClient.patch<NotificationPreference>(
      "/notifications/preferences",
      payload
    );
    return response.data;
  },
};