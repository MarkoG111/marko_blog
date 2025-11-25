import { api } from "./api";

export const getNotifications = (page = 1, perPage = 20) =>
  api.get(`/notifications?page=${page}&perPage=${perPage}`);

export const markAllNotificationsAsRead = () =>
  api.patch(`/notifications/mark-as-read`);

export const markNotificationAsRead = (id) =>
  api.patch(`/notifications/${id}/mark-as-read`);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

export const getUnreadCount = () =>
  api.get(`/notifications/unread-count`);
