import type { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../../utils/response.js";
import { weatherService } from "./weather.service.js";

const cityQuery = z.object({ city: z.string().min(1).default("Mumbai") });
const districtParams = z.object({ district: z.string().min(1) });
const districtQuery = z.object({
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional()
});

export async function getCurrentWeather(req: Request, res: Response) {
  const { city } = cityQuery.parse(req.query);
  const weather = await weatherService.getCurrentWeather(city);
  return sendSuccess(res, weather, "Current weather loaded");
}

export async function getForecast(req: Request, res: Response) {
  const { city } = cityQuery.parse(req.query);
  const forecast = await weatherService.getForecast(city);
  return sendSuccess(res, forecast, "Weather forecast loaded");
}

export async function getHistoricalWeather(req: Request, res: Response) {
  const { city } = cityQuery.parse(req.query);
  const historical = await weatherService.getHistoricalWeather(city);
  return sendSuccess(res, historical, "Historical weather loaded");
}

export async function getWeatherAlerts(req: Request, res: Response) {
  const { city } = cityQuery.parse(req.query);
  const alerts = await weatherService.getWeatherAlerts(city);
  return sendSuccess(res, alerts, "Weather alerts loaded");
}

export async function getDistrictWeather(req: Request, res: Response) {
  const { district } = districtParams.parse(req.params);
  const { lat, lng } = districtQuery.parse(req.query);
  const weather = typeof lat === "number" && typeof lng === "number"
    ? await weatherService.getDistrictWeather(lat, lng)
    : await weatherService.getDistrictWeatherByName(district);
  return sendSuccess(res, weather, "District weather loaded");
}

export async function getMapOverlay(_req: Request, res: Response) {
  const overlay = await weatherService.getMapOverlay();
  return sendSuccess(res, overlay, "Weather map overlay loaded");
}
