import type { Request, Response } from "express";
import { SOSStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { cloudinary } from "../config/cloudinary.js";
import { createSosSchema, nearbySosSchema, updateSosStatusSchema } from "../validators/sos.validator.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { createSos } from "../services/sos.service.js";
import { distanceKm } from "../services/distance.service.js";
import { emitToRole, emitToUser } from "../sockets/index.js";

export async function createSosRequest(req: Request, res: Response) {
  const input = createSosSchema.parse(req.body);
  const imageUrl = req.file ? await uploadImage(req.file.buffer) : undefined;
  const { sos, volunteers } = await createSos({ ...input, userId: req.user!.id, imageUrl });
  emitToRole("volunteer", "new-sos", sos);
  emitToRole("admin", "new-sos", sos);
  return sendSuccess(res, { sos, notifiedVolunteers: volunteers.length }, "SOS created", 201);
}

export async function nearbySos(req: Request, res: Response) {
  const input = nearbySosSchema.parse(req.query);
  const requests = await prisma.sOSRequest.findMany({
    where: { status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] } },
    include: { user: true, volunteer: { include: { user: true } } },
    orderBy: { createdAt: "desc" }
  });
  const data = requests
    .map((sos) => ({ ...sos, distanceKm: distanceKm(input, sos) }))
    .filter((sos) => sos.distanceKm <= input.radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return sendSuccess(res, data, "Nearby SOS loaded");
}

export async function getSos(req: Request, res: Response) {
  const sos = await prisma.sOSRequest.findUnique({
    where: { id: String(req.params.id) },
    include: { user: true, volunteer: { include: { user: true } } }
  });
  if (!sos) return sendError(res, "SOS not found", 404);
  return sendSuccess(res, sos, "SOS loaded");
}

export async function updateSosStatus(req: Request, res: Response) {
  const { status } = updateSosStatusSchema.parse(req.body);
  const sos = await prisma.sOSRequest.update({
    where: { id: String(req.params.id) },
    data: { status },
    include: { user: true, volunteer: { include: { user: true } } }
  });
  emitToRole("admin", "sos-status-update", { sosId: sos.id, status });
  emitToUser(sos.userId, "sos-status-update", { sosId: sos.id, status });
  if (status === SOSStatus.RESOLVED) emitToRole("admin", "rescue-completed", { sosId: sos.id });
  return sendSuccess(res, sos, "SOS status updated");
}

export async function mySos(req: Request, res: Response) {
  const requests = await prisma.sOSRequest.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: { volunteer: { include: { user: true } } }
  });
  return sendSuccess(res, requests, "SOS history loaded");
}

async function uploadImage(buffer: Buffer) {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "disasterlink/sos" }, (error, result) => {
      if (error || !result) reject(error);
      else resolve({ secure_url: result.secure_url });
    });
    stream.end(buffer);
  });
  return result.secure_url;
}
