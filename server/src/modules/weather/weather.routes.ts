import { Router } from "express";
import {
  getCurrentWeather,
  getDistrictWeather,
  getForecast,
  getHistoricalWeather,
  getMapOverlay,
  getWeatherAlerts
} from "./weather.controller.js";

export const weatherRouter = Router();

weatherRouter.get("/current", getCurrentWeather);
weatherRouter.get("/forecast", getForecast);
weatherRouter.get("/historical", getHistoricalWeather);
weatherRouter.get("/alerts", getWeatherAlerts);
weatherRouter.get("/district/:district", getDistrictWeather);
weatherRouter.get("/map-overlay", getMapOverlay);
