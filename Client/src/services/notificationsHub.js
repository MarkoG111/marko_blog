import * as signalR from "@microsoft/signalr";
import { API_BASE } from "../api/api";

export function createNotificationsHub(token) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}/api/notificationsHub`, {
      accessTokenFactory: () => token,
      transport: signalR.HttpTransportType.WebSockets
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 15000])
    .build();

  async function start(onReceiveNotification) {
    connection.on("ReceiveNotification", onReceiveNotification);

    try {
      await connection.start();
      console.log("SignalR connected");
    } catch (err) {
      console.error("Error starting SignalR", err);
      throw err;
    }
  }

  async function joinGroup(userId) {
    try {
      await connection.invoke("JoinGroup", userId.toString());
    } catch (err) {
      console.error("JoinGroup failed", err);
    }
  }

  async function stop() {
    if (connection) {
      await connection.stop();
    }
  }

  return { start, joinGroup, stop };
}
