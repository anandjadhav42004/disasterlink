import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { logger } from "../utils/logger.js";

export let io: Server | undefined;

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
      if (userId) socket.join(`user:${userId}`);
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
      socket.to("admin").emit("location-update", { socketId: socket.id, ...payload });
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
