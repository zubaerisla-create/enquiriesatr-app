import { api } from "./api";

export type NotifType = "lesson" | "ai" | "streak" | "system" | "achievement";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>("/notifications/", { requireAuth: true });
  return response.data;
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  const response = await api.get<{ count: number }>("/notifications/unread-count/", { requireAuth: true });
  return response.data;
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>(`/notifications/${id}/read/`, {}, { requireAuth: true });
  return response.data;
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>("/notifications/mark-all-read/", {}, { requireAuth: true });
  return response.data;
}

export async function dismissNotification(id: string): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>(`/notifications/${id}/dismiss/`, {}, { requireAuth: true });
  return response.data;
}

export async function clearAllNotifications(): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>("/notifications/clear-all/", {}, { requireAuth: true });
  return response.data;
}
