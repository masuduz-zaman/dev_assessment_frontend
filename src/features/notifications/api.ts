import { api } from '@/lib/http';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () => api.get<{ items: AppNotification[]; unread: number }>('/notifications'),
  markRead: (id: string) => api.patch<{ id: string; read: boolean }>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ updated: number }>('/notifications/read-all'),
};
