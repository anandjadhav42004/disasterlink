import type { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../../utils/response.js";
import { radarService } from "./radar.service.js";

const districtParams = z.object({ district: z.string().min(1) });
const districtQuery = z.object({ district: z.string().min(1).default("Mumbai") });

export async function getRadarTiles(_req: Request, res: Response) {
  const tiles = await radarService.getRadarTiles();
  return sendSuccess(res, tiles, "RainViewer radar tiles loaded");
}

export async function getLatestRadarFrame(_req: Request, res: Response) {
  const latest = await radarService.getLatestRadarFrame();
  return sendSuccess(res, latest, "Latest radar frame loaded");
}

export async function getForecastRadar(_req: Request, res: Response) {
  const forecast = await radarService.getForecastRadar();
  return sendSuccess(res, forecast, "Forecast radar loaded");
}

export async function getRadarOverlay(_req: Request, res: Response) {
  const overlay = await radarService.getRadarOverlay();
  return sendSuccess(res, overlay, "Operational radar overlay loaded");
}

export async function getRainSeverity(req: Request, res: Response) {
  const { district } = districtQuery.parse(req.query);
  const severity = await radarService.getRainIntensity(district);
  return sendSuccess(res, severity, "Rainfall severity loaded");
}

export async function getFloodRisk(req: Request, res: Response) {
  const parsed = z.object({ district: z.string().optional() }).parse(req.query);
  const risk = await radarService.getFloodRisk(parsed.district);
  return sendSuccess(res, risk, "Flood-risk analysis loaded");
}

export async function getStormTracking(_req: Request, res: Response) {
  const storms = await radarService.getStormTracking();
  return sendSuccess(res, storms, "Storm tracking loaded");
}

export async function getDistrictRadar(req: Request, res: Response) {
  const { district } = districtParams.parse(req.params);
  const payload = await radarService.getDistrictRadar(district);
  return sendSuccess(res, payload, "District radar intelligence loaded");
}
