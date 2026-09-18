export type NotificationEventType =
  | "FAVORITE_STATUS"
  | "FAVORITE_UPDATE"
  | "REPORT_RESOLUTION";

export interface Notification {
  notificationId: number;
  userId: number;
  asylumId: number | null;
  reviewId: number | null;
  eventType: NotificationEventType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  preferenceId: number;
  userId: number;
  availabilityAlert: boolean;
  updateAlert: boolean;
  moderationAlert: boolean;
}