import type { Request, Response } from "express";
import { prisma } from "../config/database.js";
import { createShelterSchema, nearbyShelterSchema, occupancySchema } from "../validators/shelter.validator.js";
import { findNearbyShelters } from "../services/shelter.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

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
  const shelter = await prisma.shelter.create({ data: input });
  return sendSuccess(res, shelter, "Shelter created", 201);
}

export async function updateOccupancy(req: Request, res: Response) {
  const { occupied } = occupancySchema.parse(req.body);
  const shelter = await prisma.shelter.update({ where: { id: String(req.params.id) }, data: { occupied } });
  return sendSuccess(res, shelter, "Occupancy updated");
}
