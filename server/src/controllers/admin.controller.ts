import type { Request, Response } from "express";
import { SOSStatus, Severity, SOSType } from "@prisma/client";
import { prisma } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { emitEmergencyAlert, emitToAdmins, emitToAll, emitToUser } from "../sockets/index.js";

export async function analytics(req: Request, res: Response) {
  const range = String(req.query.range ?? "7d");
  const days = range === "24h" ? 1 : range === "30d" ? 30 : range === "90d" ? 90 : 7;
  const since = new Date(Date.now() - days * 86400000);
  const [openIncidents, resolvedIncidents, volunteers, shelters, critical, broadcasts] = await Promise.all([
    prisma.sOSRequest.count({ where: { status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] } } }),
    prisma.sOSRequest.count({ where: { status: SOSStatus.RESOLVED } }),
    prisma.volunteer.count({ where: { isAvailable: true } }),
    prisma.shelter.count(),
    prisma.sOSRequest.count({ where: { severity: Severity.CRITICAL, status: { not: SOSStatus.RESOLVED } } }),
    prisma.alert.count({ where: { createdAt: { gte: since } } })
  ]);
  return sendSuccess(res, {
    openIncidents,
    resolvedIncidents,
    availableVolunteers: volunteers,
    shelters,
    critical,
    broadcasts,
    range,
    trends: await incidentTrend(since)
  }, "Analytics loaded");
}

export async function incidents(req: Request, res: Response) {
  const { status, severity, district, search, sort = "createdAt", order = "desc", from, to } = req.query;
  const data = await prisma.sOSRequest.findMany({
    where: {
      status: status && status !== "all" ? String(status).toUpperCase() as SOSStatus : undefined,
      severity: severity && severity !== "all" ? String(severity).toUpperCase() as Severity : undefined,
      user: district && district !== "all" ? { district: String(district) } : undefined,
      description: search ? { contains: String(search), mode: "insensitive" } : undefined,
      createdAt: from || to ? { gte: from ? new Date(String(from)) : undefined, lte: to ? new Date(String(to)) : undefined } : undefined
    },
    orderBy: { [String(sort)]: order === "asc" ? "asc" : "desc" },
    include: { user: true, volunteer: { include: { user: true } } },
    take: 100
  });
  return sendSuccess(res, data, "Incidents loaded");
}

export async function createIncident(req: Request, res: Response) {
  const input = req.body as {
    title?: string;
    description?: string;
    type?: string;
    severity?: string;
    latitude?: number;
    longitude?: number;
    district?: string;
  };
  if (!input.title || !input.latitude || !input.longitude) return sendError(res, "title, latitude and longitude are required", 400);
  const sos = await prisma.sOSRequest.create({
    data: {
      userId: req.user!.id,
      type: normalizeSosType(input.type),
      severity: normalizeSeverity(input.severity),
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
      description: `${input.title}${input.description ? `: ${input.description}` : ""}`
    },
    include: { user: true, volunteer: { include: { user: true } } }
  });
  await audit(req.user!.id, req.user!.role, "incidents.create", "incidents", "HIGH", req, { incidentId: sos.id, district: input.district });
  emitToAdmins("new-incident", sos);
  emitToAll("map-update", { type: "new-incident", payload: sos });
  return sendSuccess(res, sos, "Incident created", 201);
}

export async function updateIncident(req: Request, res: Response) {
  const id = String(req.params.id);
  const body = req.body as { status?: string; severity?: string; volunteerId?: string; description?: string };
  const volunteer = body.volunteerId
    ? await prisma.volunteer.findFirst({ where: { OR: [{ id: body.volunteerId }, { userId: body.volunteerId }] }, include: { user: true } })
    : undefined;
  const sos = await prisma.sOSRequest.update({
    where: { id },
    data: {
      status: body.status ? String(body.status).toUpperCase() as SOSStatus : undefined,
      severity: body.severity ? normalizeSeverity(body.severity) : undefined,
      description: body.description,
      volunteerId: volunteer?.id
    },
    include: { user: true, volunteer: { include: { user: true } } }
  });
  if (volunteer) {
    emitToUser(volunteer.userId, "volunteer-assigned", { sosId: sos.id, volunteer });
    emitToAdmins("volunteer-assigned", { sosId: sos.id, volunteer });
  }
  await audit(req.user!.id, req.user!.role, "incidents.update", "incidents", "HIGH", req, { incidentId: id, ...body });
  emitToAll("sos-status-update", { sosId: sos.id, status: sos.status });
  emitToAll("map-update", { type: "incident-update", payload: sos });
  return sendSuccess(res, sos, "Incident updated");
}

export async function declareEmergency(req: Request, res: Response) {
  const input = req.body as {
    title?: string;
    message?: string;
    severity?: string;
    district?: string;
    state?: string;
    deploymentLevel?: string;
    latitude?: number;
    longitude?: number;
  };
  if (!input.message || !input.district || !input.state) return sendError(res, "message, district and state are required", 400);
  const severity = normalizeSeverity(input.severity);
  const alert = await prisma.alert.create({
    data: {
      title: input.title ?? `${severity} emergency declared`,
      message: input.message,
      severity,
      district: input.district,
      state: input.state,
      latitude: input.latitude,
      longitude: input.longitude,
      channels: ["in-app", "push", "sms", "email"],
      metadata: { deploymentLevel: input.deploymentLevel ?? "district" }
    }
  });
  const incident = input.latitude && input.longitude
    ? await prisma.sOSRequest.create({
        data: {
          userId: req.user!.id,
          type: SOSType.OTHER,
          severity,
          latitude: Number(input.latitude),
          longitude: Number(input.longitude),
          description: input.message
        }
      })
    : null;
  const payload = { alert, incident };
  await audit(req.user!.id, req.user!.role, "emergency.declare", "emergency", "CRITICAL", req, payload);
  emitEmergencyAlert(payload);
  if (incident) emitToAdmins("new-incident", incident);
  emitToAll("map-update", { type: "emergency-alert", payload });
  return sendSuccess(res, payload, "Emergency declared", 201);
}

export async function volunteers(_req: Request, res: Response) {
  const data = await prisma.volunteer.findMany({ include: { user: true, assignedRequests: true } });
  return sendSuccess(res, data, "Volunteers loaded");
}

export async function broadcast(req: Request, res: Response) {
  const { title = "Emergency broadcast", message = "", severity = "MEDIUM", district, state, channels = ["in-app"] } = req.body as {
    title?: string;
    message?: string;
    severity?: string;
    district?: string;
    state?: string;
    channels?: string[];
  };
  const alert = await prisma.alert.create({
    data: { title, message, severity: normalizeSeverity(severity), district, state, channels }
  });
  const payload = { ...alert, channels };
  await audit(req.user!.id, req.user!.role, "alerts.broadcast", "alerts", "HIGH", req, { alertId: alert.id, channels });
  emitEmergencyAlert(payload);
  return sendSuccess(res, payload, "Broadcast sent");
}

export async function auditLogs(req: Request, res: Response) {
  const data = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Number(req.query.take ?? 100),
    include: { user: { select: { id: true, name: true, email: true, role: true } } }
  });
  return sendSuccess(res, data, "Audit logs loaded");
}

export async function heatmap(_req: Request, res: Response) {
  const points = await prisma.sOSRequest.findMany({
    select: { latitude: true, longitude: true, severity: true, status: true },
    where: { status: { not: SOSStatus.CANCELLED } },
    take: 500
  });
  return sendSuccess(res, points, "Heatmap loaded");
}

function normalizeSeverity(value?: string): Severity {
  const normalized = String(value ?? "MEDIUM").toUpperCase();
  return normalized in Severity ? normalized as Severity : Severity.MEDIUM;
}

function normalizeSosType(value?: string): SOSType {
  const normalized = String(value ?? "OTHER").toUpperCase().replace("-", "_");
  return normalized in SOSType ? normalized as SOSType : SOSType.OTHER;
}

async function incidentTrend(since: Date) {
  const rows = await prisma.sOSRequest.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, severity: true }
  });
  const byDate = new Map<string, { date: string; total: number; critical: number }>();
  for (const row of rows) {
    const date = row.createdAt.toISOString().slice(0, 10);
    const bucket = byDate.get(date) ?? { date, total: 0, critical: 0 };
    bucket.total += 1;
    if (row.severity === Severity.CRITICAL) bucket.critical += 1;
    byDate.set(date, bucket);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function audit(
  userId: string | undefined,
  role: string | undefined,
  action: string,
  module: string,
  severity: string,
  req: Request,
  metadata: object
) {
  await prisma.auditLog.create({
    data: { userId, role, action, module, severity, ip: req.ip, device: req.headers["user-agent"], metadata }
  });
}
