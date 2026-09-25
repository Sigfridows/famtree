export type NotificationEventType =
  | "FAVORITE_STATUS"
  | "FAVORITE_UPDATE"
  | "REPORT_RESOLUTION";

// Contrato oficial de la API backend (FastAPI / camelCase)
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

export type NotificationVariant = "light" | "dark" | "glass";

// Modelo adaptado para el componente visual Popover
export interface NotificationUIItem {
  id: string;
  rawId: number;
  type: "rating" | "appointment" | "status";
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  createdAtDate: Date;
}