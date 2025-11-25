import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  getUnreadCount,
} from "../api/notificationsApi";

import { createNotificationsHub } from "./notificationsHub";

export function NotificationsService() {
  let connection = null;

  const initSignalR = async ({ token, userId, onReceive }) => {
    connection = createNotificationsHub(token);

    await connection.start(onReceive);
    await connection.joinGroup(userId);
  };

  const cleanupSignalR = async () => {
    if (connection) {
      await connection.stop();
    }
  };

  return {
    // REST
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    getUnreadCount,

    // SignalR
    initSignalR,
    cleanupSignalR,
  };
}
