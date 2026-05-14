import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger.js";

export let io: Server | undefined;
export const userSocketMap = new Map<string, Set<string>>();

function addUserSocket(userId: string, socketId: string) {
  const sockets = userSocketMap.get(userId) ?? new Set<string>();
  sockets.add(socketId);
  userSocketMap.set(userId, sockets);
}

function removeSocket(socketId: string) {
  for (const [userId, sockets] of userSocketMap.entries()) {
    sockets.delete(socketId);
    if (sockets.size === 0) userSocketMap.delete(userId);
  }
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL ?? process.env.FRONTEND_URL ?? "*",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-room", ({ role, userId }: { role?: string; userId?: string }) => {
      if (role) socket.join(role.toLowerCase());
      if (userId) {
        socket.join(`user:${userId}`);
        addUserSocket(userId, socket.id);
      }
      logger.info("Socket joined rooms", { socketId: socket.id, role, userId });
    });

    socket.on("sos-created", (payload) => {
      socket.to("volunteer").emit("new-sos", payload);
      socket.to("admin").emit("new-sos", payload);
    });

    socket.on("volunteer-update", (payload) => {
      io?.to("admin").emit("sos-status-update", payload);
    });

    socket.on("location-update", (payload) => {
      socket.to("admin").emit("volunteer-location", { socketId: socket.id, ...payload });
      socket.to("admin").emit("location-update", { socketId: socket.id, ...payload });
      socket.to("admin").emit("map-update", { type: "volunteer-location", payload: { socketId: socket.id, ...payload } });
    });

    socket.on("chat-join", ({ room }: { room?: string }) => {
      if (room) socket.join(`chat:${room}`);
    });

    socket.on("chat-message", (payload: { room?: string; message?: string; userId?: string; userName?: string }) => {
      const message = { ...payload, id: randomUUID(), createdAt: new Date().toISOString() };
      if (payload.room) io?.to(`chat:${payload.room}`).emit("chat-message", message);
      else io?.emit("chat-message", message);
    });

    socket.on("volunteer-sos", (payload) => {
      io?.to("admin").emit("sos-status-update", { ...payload, status: "VOLUNTEER_BACKUP_REQUESTED" });
      io?.to("volunteer").emit("sos-status-update", { ...payload, status: "VOLUNTEER_BACKUP_REQUESTED" });
    });

    socket.on("assignment-requested", (payload) => {
      io?.to("admin").emit("request-created", { ...payload, source: "volunteer-assignment-request" });
    });

    socket.on("disconnect", () => {
      removeSocket(socket.id);
    });
  });

  return io;
}

export function emitToRole(role: string, event: string, payload: unknown) {
  io?.to(role.toLowerCase()).emit(event, payload);
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToVolunteers(event: string, payload: unknown) {
  emitToRole("volunteer", event, payload);
}

export function emitToAdmins(event: string, payload: unknown) {
  emitToRole("admin", event, payload);
}

export function emitToAll(event: string, payload: unknown) {
  io?.emit(event, payload);
}

export function emitEmergencyAlert(payload: unknown) {
  emitToAll("emergency-alert", payload);
}
