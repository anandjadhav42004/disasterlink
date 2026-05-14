"use client";

import { io, type Socket } from "socket.io-client";
import type { UserRole } from "@/types";

export type ServerToClientEvent =
  | "connect"
  | "disconnect"
  | "new-sos"
  | "new-incident"
  | "volunteer-assigned"
  | "emergency-alert"
  | "sos-status-update"
  | "shelter-update"
  | "chat-message"
  | "request-created"
  | "volunteer-location"
  | "force-logout"
  | "rescue-completed"
  | "map-update"
  | "location-update";

let socket: Socket | null = null;

function getSocketUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

function normalizeSocketRole(role: UserRole | null) {
  return role;
}

export function getSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      transports: ["websocket", "polling"]
    });
  }

  return socket;
}

export function connectSocket(user: { id: string; role: UserRole | null } | null) {
  if (!user) return null;

  const activeSocket = getSocket();
  if (!activeSocket.connected) activeSocket.connect();

  activeSocket.emit("join-room", {
    userId: user.id,
    role: normalizeSocketRole(user.role)
  });

  return activeSocket;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
