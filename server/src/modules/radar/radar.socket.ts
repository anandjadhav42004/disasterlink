import { emitToAdmins, emitToAll, emitToRole, emitToVolunteers } from "../../sockets/index.js";
import type { FloodRiskZonePayload, RadarAlertPayload, RadarOverlay, RadarTilesPayload, StormTrack, OperationalRiskScore } from "./radar.types.js";

export function emitRadarUpdate(payload: RadarTilesPayload) {
  emitToAll("radar-update", payload);
  emitToAll("weather-overlay-update", payload);
  emitToAll("map-update", { type: "radar-update", payload });
}

export function emitStormUpdate(payload: StormTrack[]) {
  emitToAll("storm-update", payload);
  emitToAll("map-update", { type: "storm-update", payload });
}

export function emitFloodRiskUpdate(payload: FloodRiskZonePayload[]) {
  emitToAll("flood-risk-update", payload);
  emitToAdmins("flood-risk-update", payload);
  emitToVolunteers("flood-risk-update", payload);
  emitToAll("map-update", { type: "flood-risk-update", payload });
}

export function emitRainfallAlert(alert: RadarAlertPayload) {
  emitToAll("rainfall-alert", alert);
  emitToAll("emergency-alert", {
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    source: "radar"
  });
  emitToAdmins("rainfall-alert", alert);
  emitToVolunteers("rainfall-alert", alert);
  emitToRole("district_coordinator", "rainfall-alert", alert);
}

export function emitRadarOverlay(payload: RadarOverlay) {
  emitToAll("weather-overlay-update", payload);
  emitToAll("map-update", { type: "weather-overlay-update", payload });
}

export function emitDistrictRiskUpdate(payload: OperationalRiskScore[]) {
  emitToAll("district-risk-update", payload);
  emitToAll("map-update", { type: "district-risk-update", payload });
}
