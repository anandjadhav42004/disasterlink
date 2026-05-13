import type { Request, Response } from "express";
import { SOSStatus, Severity } from "@prisma/client";
import { prisma } from "../config/database.js";
import { sendSuccess } from "../utils/response.js";
import { emitToRole } from "../sockets/index.js";

export async function analytics(_req: Request, res: Response) {
  const [openIncidents, resolvedIncidents, volunteers, shelters, critical] = await Promise.all([
    prisma.sOSRequest.count({ where: { status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] } } }),
    prisma.sOSRequest.count({ where: { status: SOSStatus.RESOLVED } }),
    prisma.volunteer.count({ where: { isAvailable: true } }),
    prisma.shelter.count(),
    prisma.sOSRequest.count({ where: { severity: Severity.CRITICAL, status: { not: SOSStatus.RESOLVED } } })
  ]);
  return sendSuccess(res, { openIncidents, resolvedIncidents, availableVolunteers: volunteers, shelters, critical }, "Analytics loaded");
}

export async function incidents(_req: Request, res: Response) {
  const data = await prisma.sOSRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, volunteer: { include: { user: true } } },
    take: 100
  });
  return sendSuccess(res, data, "Incidents loaded");
}

export async function volunteers(_req: Request, res: Response) {
  const data = await prisma.volunteer.findMany({ include: { user: true, assignedRequests: true } });
  return sendSuccess(res, data, "Volunteers loaded");
}

export async function broadcast(req: Request, res: Response) {
  const { title = "Emergency broadcast", message = "" } = req.body as { title?: string; message?: string };
  const payload = { title, message, createdAt: new Date().toISOString() };
  emitToRole("survivor", "emergency-alert", payload);
  emitToRole("volunteer", "emergency-alert", payload);
  return sendSuccess(res, payload, "Broadcast sent");
}

export async function heatmap(_req: Request, res: Response) {
  const points = await prisma.sOSRequest.findMany({
    select: { latitude: true, longitude: true, severity: true, status: true },
    where: { status: { not: SOSStatus.CANCELLED } },
    take: 500
  });
  return sendSuccess(res, points, "Heatmap loaded");
}
