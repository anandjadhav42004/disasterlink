import type { DisasterWeather, WeatherAlertPayload, WeatherMapOverlay } from "./weather.types.js";
import { emitToAdmins, emitToAll, emitToRole, emitToVolunteers } from "../../sockets/index.js";

export function emitWeatherUpdate(weather: DisasterWeather) {
  emitToAll("weather-update", weather);
  emitToAll("district-weather-update", weather);
  emitToAll("map-update", { type: "weather-update", payload: weather });
}

export function emitWeatherAlert(alert: WeatherAlertPayload) {
  emitToAll("weather-alert", alert);
  emitToAll("emergency-alert", {
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    source: "weather"
  });
  emitToAdmins("weather-alert", alert);
  emitToVolunteers("weather-alert", alert);
  emitToRole("district_coordinator", "weather-alert", alert);

  if (alert.type === "RAINFALL") emitToAll("rainfall-warning", alert);
  if (alert.type === "HEATWAVE") emitToAll("heatwave-warning", alert);
  if (alert.type === "CYCLONE") emitToAll("cyclone-warning", alert);
}

export function emitWeatherOverlay(overlay: WeatherMapOverlay) {
  emitToAll("weather-map-overlay", overlay);
  emitToAll("map-update", { type: "weather-overlay", payload: overlay });
}
