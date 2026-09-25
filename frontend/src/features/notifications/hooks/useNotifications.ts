"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationsApi } from "../api/notificationsService";
import type { Notification, NotificationUIItem } from "../types/notification.types";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Ahora";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

function mapEventTypeToUIType(eventType: string): NotificationUIItem["type"] {
  switch (eventType) {
    case "REPORT_RESOLUTION":
      return "rating";
    case "FAVORITE_UPDATE":
      return "appointment";
    case "FAVORITE_STATUS":
    default:
      return "status";
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [list, count] = await Promise.all([
        notificationsApi.getNotifications(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch {
      // Manejo silencioso en notificaciones de la barra superior
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  let isMounted = true;

  const init = async () => {
    if (isMounted) {
      await fetchNotifications();
    }
  };

  void init();

  return () => {
    isMounted = false;
  };
}, [fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationsApi.markAsRead(notificationId);
    } catch {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationsApi.markAllAsRead();
    } catch {
      fetchNotifications();
    }
  };

  const uiNotifications: NotificationUIItem[] = notifications.map((item) => ({
    id: String(item.notificationId),
    rawId: item.notificationId,
    type: mapEventTypeToUIType(item.eventType),
    title: item.title,
    description: item.message,
    time: formatRelativeTime(item.createdAt),
    isUnread: !item.isRead,
    createdAtDate: new Date(item.createdAt),
  }));

  return {
    notifications: uiNotifications,
    rawNotifications: notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}