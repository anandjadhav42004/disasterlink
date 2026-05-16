import { Router } from "express";
import {
  getDistrictRadar,
  getFloodRisk,
  getForecastRadar,
  getLatestRadarFrame,
  getRadarOverlay,
  getRadarTiles,
  getRainSeverity,
  getStormTracking
} from "./radar.controller.js";

export const radarRouter = Router();

radarRouter.get("/tiles", getRadarTiles);
radarRouter.get("/latest", getLatestRadarFrame);
radarRouter.get("/forecast", getForecastRadar);
radarRouter.get("/overlay", getRadarOverlay);
radarRouter.get("/severity", getRainSeverity);
radarRouter.get("/flood-risk", getFloodRisk);
radarRouter.get("/storm-tracking", getStormTracking);
radarRouter.get("/district/:district", getDistrictRadar);
