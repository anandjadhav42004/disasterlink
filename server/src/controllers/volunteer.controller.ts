import type { Request, Response } from "express";
import { SOSStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { acceptSosTask } from "../services/volunteer.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { emitToRole, emitToUser } from "../sockets/index.js";

export async function tasks(req: Request, res: Response) {
  const volunteer = await prisma.volunteer.findUnique({ where: { userId: req.user!.id } });
  if (!volunteer) return sendError(res, "Volunteer profile not found", 404);
  const data = await prisma.sOSRequest.findMany({
    where: { volunteerId: volunteer.id },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  return sendSuccess(res, data, "Tasks loaded");
}

export async function acceptTask(req: Request, res: Response) {
  const sos = await acceptSosTask(String(req.params.id), req.user!.id);
  emitToRole("admin", "volunteer-assigned", { sosId: sos.id, volunteer: sos.volunteer });
  emitToUser(sos.userId, "volunteer-assigned", { sosId: sos.id, volunteer: sos.volunteer });
  return sendSuccess(res, sos, "Task accepted");
}

export async function completeTask(req: Request, res: Response) {
  const volunteer = await prisma.volunteer.findUnique({ where: { userId: req.user!.id } });
  if (!volunteer) return sendError(res, "Volunteer profile not found", 404);
  const sos = await prisma.sOSRequest.update({
    where: { id: String(req.params.id) },
    data: { status: SOSStatus.RESOLVED },
    include: { user: true }
  });
  emitToRole("admin", "rescue-completed", { sosId: sos.id });
  emitToUser(sos.userId, "rescue-completed", { sosId: sos.id });
  return sendSuccess(res, sos, "Task completed");
}

export async function availability(req: Request, res: Response) {
  const { isAvailable } = req.body as { isAvailable?: boolean };
  const volunteer = await prisma.volunteer.update({
    where: { userId: req.user!.id },
    data: { isAvailable: Boolean(isAvailable) }
  });
  return sendSuccess(res, volunteer, "Availability updated");
}

export async function stats(req: Request, res: Response) {
  const volunteer = await prisma.volunteer.findUnique({ where: { userId: req.user!.id } });
  if (!volunteer) return sendError(res, "Volunteer profile not found", 404);
  const [completed, active] = await Promise.all([
    prisma.sOSRequest.count({ where: { volunteerId: volunteer.id, status: SOSStatus.RESOLVED } }),
    prisma.sOSRequest.count({ where: { volunteerId: volunteer.id, status: { in: [SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] } } })
  ]);
  return sendSuccess(res, { completed, active }, "Stats loaded");
}
