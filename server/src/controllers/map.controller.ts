import type { Request, Response } from "express";
import { z } from "zod";
import { getHeatmapPoints, getLiveMapData, getMapShelters } from "../services/map.service.js";
import { sendSuccess } from "../utils/response.js";

const mapShelterQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(500).default(50)
}).refine(
  (value) => (value.latitude === undefined && value.longitude === undefined) || (value.latitude !== undefined && value.longitude !== undefined),
  { message: "latitude and longitude must be provided together" }
);

// Aliases for compatibility with other routes/versions
export const getLive = liveMap;
export const getShelters = mapShelters;
export const getHeatmap = heatmap;

export async function liveMap(_req: Request, res: Response) {
  return sendSuccess(res, await getLiveMapData(), "Live map loaded");
}

export async function mapShelters(req: Request, res: Response) {
  const input = mapShelterQuerySchema.parse(req.query);
  return sendSuccess(
    res,
    await getMapShelters(input.latitude, input.longitude, input.radiusKm),
    "Map shelters loaded"
  );
}

export async function heatmap(req: Request, res: Response) {
  return sendSuccess(res, await getHeatmapPoints(), "Heatmap loaded");
}
