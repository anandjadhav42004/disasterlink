import type { Request, Response } from "express";
import { Severity } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { sendSuccess } from "../utils/response.js";
import { broadcastAlert } from "../services/notification.service.js";
import { emitToRole } from "../sockets/index.js";

const alertSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(5),
  severity: z.nativeEnum(Severity),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  radius: z.coerce.number().positive().optional()
});

export async function listAlerts(_req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });
  return sendSuccess(res, alerts, "Alerts loaded");
}

export async function createAlert(req: Request, res: Response) {
  const input = alertSchema.parse(req.body);
  const alert = await prisma.alert.create({ data: input });
  const users = await prisma.user.findMany({ select: { fcmToken: true, phone: true } });
  await broadcastAlert(alert, users);
  emitToRole("survivor", "emergency-alert", alert);
  emitToRole("volunteer", "emergency-alert", alert);
  return sendSuccess(res, alert, "Alert broadcast", 201);
}

export async function deleteAlert(req: Request, res: Response) {
  await prisma.alert.delete({ where: { id: String(req.params.id) } });
  return sendSuccess(res, null, "Alert removed");
}
