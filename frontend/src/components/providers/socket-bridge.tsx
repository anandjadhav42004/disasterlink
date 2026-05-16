"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/store/auth-store";
import { useOperationsStore, type LiveIncident, type LiveShelter } from "@/store/operations-store";
import { useRadarStore, type FloodRiskZone, type OperationalRisk, type RadarAlert, type RadarOverlay, type RadarTilesPayload, type StormTrack } from "@/store/radar-store";
import { useWeatherStore, type DisasterWeather, type WeatherAlert, type WeatherMapOverlay } from "@/store/weather-store";

interface EmergencyAlert {
  title?: string;
  message?: string;
}

export function SocketBridge() {
  const { on } = useSocket();
  const logout = useAuthStore((state) => state.logout);
  const upsertIncident = useOperationsStore((state) => state.upsertIncident);
  const upsertShelter = useOperationsStore((state) => state.upsertShelter);
  const applyBackgroundWeatherUpdate = useWeatherStore((state) => state.applyBackgroundWeatherUpdate);
  const applyWeatherAlert = useWeatherStore((state) => state.applyWeatherAlert);
  const applyWeatherOverlay = useWeatherStore((state) => state.applyWeatherOverlay);
  const applyRadarUpdate = useRadarStore((state) => state.applyRadarUpdate);
  const applyStormUpdate = useRadarStore((state) => state.applyStormUpdate);
  const applyFloodRiskUpdate = useRadarStore((state) => state.applyFloodRiskUpdate);
  const applyDistrictRiskUpdate = useRadarStore((state) => state.applyDistrictRiskUpdate);
  const applyWeatherOverlayUpdate = useRadarStore((state) => state.applyWeatherOverlayUpdate);
  const applyRainfallAlert = useRadarStore((state) => state.applyRainfallAlert);

  useEffect(() => {
    const offIncident = on<LiveIncident>("new-incident", (payload) => {
      upsertIncident(payload);
      toast.error("New incident created", { description: payload.description });
    });

    const offEmergency = on<EmergencyAlert>("emergency-alert", (payload) => {
      toast.warning(payload.title || "Emergency alert", {
        description: payload.message
      });
    });

    const offAssigned = on<{ sosId?: string }>("volunteer-assigned", (payload) => {
      toast.success("Volunteer assigned", {
        description: payload.sosId ? `SOS ${payload.sosId} has a responder.` : undefined
      });
    });

    const offStatus = on<{ sosId?: string; status?: string }>("sos-status-update", (payload) => {
      toast.info("SOS status updated", {
        description: [payload.sosId, payload.status].filter(Boolean).join(" - ") || undefined
      });
    });

    const offShelter = on<{ shelter: LiveShelter; action: string }>("shelter-update", (payload) => {
      upsertShelter(payload.shelter);
      toast.info("Shelter updated", { description: `${payload.shelter.name} ${payload.action}` });
    });

    const offRequest = on<LiveIncident>("request-created", (payload) => {
      upsertIncident(payload);
      toast.info("New citizen request", { description: payload.description });
    });

    const offLogout = on<{ reason?: string }>("force-logout", async (payload) => {
      await logout();
      toast.error("Session ended", { description: payload.reason ?? "Your account permissions changed." });
    });

    const offWeatherUpdate = on<DisasterWeather>("weather-update", (payload) => {
      applyBackgroundWeatherUpdate(payload);
    });

    const offDistrictWeather = on<DisasterWeather>("district-weather-update", (payload) => {
      applyBackgroundWeatherUpdate(payload);
    });

    const offWeatherAlert = on<WeatherAlert>("weather-alert", (payload) => {
      applyWeatherAlert(payload);
      toast.error(payload.title || "Severe weather alert", { description: payload.message });
    });

    const offWeatherOverlay = on<WeatherMapOverlay>("weather-map-overlay", (payload) => {
      applyWeatherOverlay(payload);
    });

    const offRadarUpdate = on<RadarTilesPayload>("radar-update", (payload) => {
      applyRadarUpdate(payload);
    });

    const offStormUpdate = on<StormTrack[]>("storm-update", (payload) => {
      applyStormUpdate(payload);
    });

    const offFloodRiskUpdate = on<FloodRiskZone[]>("flood-risk-update", (payload) => {
      applyFloodRiskUpdate(payload);
    });

    const offDistrictRiskUpdate = on<OperationalRisk[]>("district-risk-update", (payload) => {
      applyDistrictRiskUpdate(payload);
    });

    const offRadarOverlay = on<RadarOverlay | RadarTilesPayload>("weather-overlay-update", (payload) => {
      applyWeatherOverlayUpdate(payload);
    });

    const offRainfallAlert = on<RadarAlert>("rainfall-alert", (payload) => {
      applyRainfallAlert(payload);
      toast.error(payload.title || "Radar rainfall alert", { description: payload.message });
    });

    return () => {
      offIncident();
      offEmergency();
      offAssigned();
      offStatus();
      offShelter();
      offRequest();
      offLogout();
      offWeatherUpdate();
      offDistrictWeather();
      offWeatherAlert();
      offWeatherOverlay();
      offRadarUpdate();
      offStormUpdate();
      offFloodRiskUpdate();
      offDistrictRiskUpdate();
      offRadarOverlay();
      offRainfallAlert();
    };
  }, [
    applyDistrictRiskUpdate,
    applyFloodRiskUpdate,
    applyRadarUpdate,
    applyRainfallAlert,
    applyStormUpdate,
    applyWeatherAlert,
    applyWeatherOverlay,
    applyWeatherOverlayUpdate,
    applyBackgroundWeatherUpdate,
    logout,
    on,
    upsertIncident,
    upsertShelter
  ]);

  return null;
}
