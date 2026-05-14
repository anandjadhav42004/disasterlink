import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { createShelterSchema, nearbyShelterSchema, occupancySchema, updateShelterSchema } from "../validators/shelter.validator.js";
import { findNearbyShelters } from "../services/shelter.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { emitToAll } from "../sockets/index.js";

export async function listShelters(req: Request, res: Response) {
  const { status, district, search } = req.query;
  const shelters = await prisma.shelter.findMany({
    where: {
      status: status && status !== "all" ? String(status) : undefined,
      district: district && district !== "all" ? String(district) : undefined,
      name: search ? { contains: String(search), mode: "insensitive" } : undefined
    },
    orderBy: { updatedAt: "desc" }
  });
  return sendSuccess(res, shelters, "Shelters loaded");
}

export async function nearbyShelters(req: Request, res: Response) {
  const input = nearbyShelterSchema.parse(req.query);
  return sendSuccess(res, await findNearbyShelters(input.latitude, input.longitude, input.radiusKm), "Nearby shelters loaded");
}

export async function getShelter(req: Request, res: Response) {
  const shelter = await prisma.shelter.findUnique({ where: { id: String(req.params.id) } });
  if (!shelter) return sendError(res, "Shelter not found", 404);
  return sendSuccess(res, shelter, "Shelter loaded");
}

export async function createShelter(req: Request, res: Response) {
  const input = createShelterSchema.parse(req.body);
  const shelter = await prisma.shelter.create({ data: { ...input, resources: input.resources as Prisma.InputJsonValue | undefined } });
  await audit(req, "shelters.create", shelter.id);
  emitToAll("shelter-update", { action: "created", shelter });
  emitToAll("map-update", { type: "shelter-update", payload: shelter });
  return sendSuccess(res, shelter, "Shelter created", 201);
}

export async function updateShelter(req: Request, res: Response) {
  const input = updateShelterSchema.parse(req.body);
  const shelter = await prisma.shelter.update({ where: { id: String(req.params.id) }, data: { ...input, resources: input.resources as Prisma.InputJsonValue | undefined } });
  await audit(req, "shelters.update", shelter.id);
  emitToAll("shelter-update", { action: "updated", shelter });
  emitToAll("map-update", { type: "shelter-update", payload: shelter });
  return sendSuccess(res, shelter, "Shelter updated");
}

export async function updateOccupancy(req: Request, res: Response) {
  const { occupied } = occupancySchema.parse(req.body);
  const shelter = await prisma.shelter.update({ where: { id: String(req.params.id) }, data: { occupied } });
  await audit(req, "shelters.occupancy", shelter.id);
  emitToAll("shelter-update", { action: "occupancy", shelter });
  emitToAll("map-update", { type: "shelter-update", payload: shelter });
  return sendSuccess(res, shelter, "Occupancy updated");
}

export async function deleteShelter(req: Request, res: Response) {
  const shelter = await prisma.shelter.delete({ where: { id: String(req.params.id) } });
  await audit(req, "shelters.delete", shelter.id);
  emitToAll("shelter-update", { action: "deleted", shelter });
  emitToAll("map-update", { type: "shelter-delete", payload: shelter });
  return sendSuccess(res, shelter, "Shelter deleted");
}

async function audit(req: Request, action: string, shelterId: string) {
  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      role: req.user?.role,
      action,
      module: "shelters",
      severity: action.endsWith("delete") ? "HIGH" : "INFO",
      ip: req.ip,
      device: req.headers["user-agent"],
      metadata: { shelterId }
    }
  });
}
