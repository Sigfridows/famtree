import { apiClient } from "@/lib/apiClient";
import type { Notification, NotificationPreference } from "../types/notification.types";

export const notificationsService = {
  getNotifications: async (offset = 0, limit = 20): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[] | { items: Notification[] }>("/notifications", {
      params: { offset, limit },
    });

    if (Array.isArray(data)) {
      return data;
    }
    return data?.items || [];
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count");
    return data?.count ?? 0;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },

  getPreferences: async (): Promise<NotificationPreference> => {
    const { data } = await apiClient.get<NotificationPreference>("/notification-preferences");
    return data;
  },

  updatePreferences: async (payload: Partial<NotificationPreference>): Promise<NotificationPreference> => {
    const { data } = await apiClient.patch<NotificationPreference>("/notification-preferences", payload);
    return data;
  },
};

// Alias de compatibilidad por si se importa con otro nombre
export const notificationsApi = notificationsService;