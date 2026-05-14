import { Router } from "express";
import { SOSType } from "@prisma/client";
import { prisma } from "../config/database.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitToAdmins, emitToAll, emitToVolunteers } from "../sockets/index.js";

export const requestRouter = Router();

requestRouter.use(requireAuth);

requestRouter.post("/", async (req, res) => {
  const body = req.body as { type?: string; description?: string; latitude?: number; longitude?: number; severity?: string };
  if (!body.type || body.latitude === undefined || body.longitude === undefined) {
    return sendError(res, "type, latitude and longitude are required", 400);
  }
  const request = await prisma.sOSRequest.create({
    data: {
      userId: req.user!.id,
      type: normalizeType(body.type),
      description: body.description,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      severity: normalizeSeverity(body.severity)
    },
    include: { user: true, volunteer: { include: { user: true } } }
  });
  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      role: req.user!.role,
      action: "requests.create",
      module: "requests",
      severity: "HIGH",
      ip: req.ip,
      device: req.headers["user-agent"],
      metadata: { requestId: request.id, type: body.type }
    }
  });
  emitToAdmins("request-created", request);
  emitToVolunteers("request-created", request);
  emitToAll("map-update", { type: "request-created", payload: request });
  return sendSuccess(res, request, "Request created", 201);
});

function normalizeType(value: string): SOSType {
  const map: Record<string, SOSType> = {
    food: SOSType.OTHER,
    medical: SOSType.MEDICAL,
    evacuation: SOSType.OTHER,
    rescue: SOSType.TRAPPED
  };
  const normalized = value.toLowerCase();
  return map[normalized] ?? SOSType.OTHER;
}

function normalizeSeverity(value?: string) {
  const normalized = String(value ?? "MEDIUM").toUpperCase();
  return ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(normalized) ? normalized as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" : "MEDIUM";
}
