"use client";

import { create } from "zustand";
import { radarService } from "@/services";

export type RadarRiskLevel = "SAFE" | "MODERATE" | "SEVERE" | "CRITICAL";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RainViewerFrame {
  time: number;
  path: string;
  tileUrl: string;
  coverageUrl: string;
  generatedAt: string;
}

export interface RadarTilesPayload {
  provider: "rainviewer";
  version: string;
  generatedAt: string;
  host: string;
  tileTemplate: string;
  coverageTemplate: string;
  past: RainViewerFrame[];
  forecast: RainViewerFrame[];
  attribution: string;
}

export interface RainIntensity {
  district: string;
  coordinates: Coordinates;
  intensity: number;
  rainfallMmHr: number;
  severity: RadarRiskLevel;
  source: string;
  observedAt: string;
}

export interface FloodRiskZone {
  id: string;
  district: string;
  state: string;
  coordinates: Coordinates;
  probability: number;
  severity: RadarRiskLevel;
  triggers: string[];
  recommendedActions: string[];
  createdAt: string;
}

export interface StormTrack {
  id: string;
  name: string;
  severity: RadarRiskLevel;
  intensity: number;
  direction: number;
  speedKmph: number;
  centroid: Coordinates;
  trajectory: Coordinates[];
  affectedDistricts: string[];
  projectedImpact: string;
  updatedAt: string;
}

export interface OperationalRisk {
  district: string;
  state?: string;
  coordinates: Coordinates;
  rainIntensity: number;
  windSpeed: number;
  floodProbability: number;
  sosDensity: number;
  shelterOccupancy: number;
  volunteerAvailability: number;
  incidentSeverity: number;
  score: number;
  level: RadarRiskLevel;
  recommendations: string[];
  calculatedAt: string;
}

export interface RadarOverlayMarker {
  id: string;
  district: string;
  coordinates: Coordinates;
  severity: RadarRiskLevel;
  value: number;
  label: string;
  type: string;
}

export interface RadarOverlay {
  generatedAt: string;
  layers: {
    rainRadar: RainViewerFrame[];
    cloudCoverage: RadarOverlayMarker[];
    stormMovement: StormTrack[];
    floodRisk: FloodRiskZone[];
    weatherSeverity: RadarOverlayMarker[];
    incidentHeatmap: RadarOverlayMarker[];
    evacuationZones: RadarOverlayMarker[];
  };
}

export interface RadarAlert {
  title: string;
  message: string;
  district: string;
  state: string;
  severity: RadarRiskLevel;
  type: string;
  coordinates: Coordinates;
  triggers: string[];
  recommendedActions: string[];
  createdAt: string;
}

export interface DistrictRadar {
  district: string;
  state: string;
  coordinates: Coordinates;
  latestFrame: RainViewerFrame | null;
  rainIntensity: RainIntensity;
  floodRisk: FloodRiskZone | null;
  stormTracking: StormTrack[];
  operationalRisk: OperationalRisk;
}

type ApiEnvelope<T> = { data: { data: T } };

export type OverlayKey =
  | "rainRadar"
  | "cloudCoverage"
  | "stormMovement"
  | "floodRisk"
  | "activeSos"
  | "shelters"
  | "volunteers"
  | "emergencyVehicles"
  | "weatherSeverity"
  | "incidentHeatmap"
  | "evacuationZones";

interface RadarState {
  radarFrames: RainViewerFrame[];
  forecastFrames: RainViewerFrame[];
  stormTracking: StormTrack[];
  floodRisk: FloodRiskZone[];
  districtSeverity: Record<string, OperationalRisk>;
  rainIntensity: RainIntensity | null;
  operationalRisk: OperationalRisk[];
  mapOverlays: RadarOverlay | null;
  alerts: RadarAlert[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedDistrict: string;
  activeLayers: Record<OverlayKey, boolean>;
  fetchRadarTiles: () => Promise<void>;
  fetchOverlay: () => Promise<void>;
  fetchFloodRisk: (district?: string) => Promise<void>;
  fetchStormTracking: () => Promise<void>;
  fetchSeverity: (district?: string) => Promise<void>;
  fetchDistrictRadar: (district: string) => Promise<void>;
  toggleLayer: (layer: OverlayKey) => void;
  applyRadarUpdate: (payload: RadarTilesPayload) => void;
  applyStormUpdate: (payload: StormTrack[]) => void;
  applyFloodRiskUpdate: (payload: FloodRiskZone[]) => void;
  applyDistrictRiskUpdate: (payload: OperationalRisk[]) => void;
  applyWeatherOverlayUpdate: (payload: RadarOverlay | RadarTilesPayload) => void;
  applyRainfallAlert: (payload: RadarAlert) => void;
}

function unwrap<T>(response: ApiEnvelope<T>) {
  return response.data.data;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("timeout")) {
      return "Radar provider is responding slowly. Keeping the last synchronized radar layer.";
    }
    return error.message;
  }
  return "Radar intelligence is temporarily unavailable.";
}

const defaultLayers: RadarState["activeLayers"] = {
  rainRadar: true,
  cloudCoverage: true,
  stormMovement: true,
  floodRisk: true,
  activeSos: true,
  shelters: true,
  volunteers: true,
  emergencyVehicles: false,
  weatherSeverity: true,
  incidentHeatmap: true,
  evacuationZones: true
};

export const useRadarStore = create<RadarState>((set, get) => ({
  radarFrames: [],
  forecastFrames: [],
  stormTracking: [],
  floodRisk: [],
  districtSeverity: {},
  rainIntensity: null,
  operationalRisk: [],
  mapOverlays: null,
  alerts: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedDistrict: "Mumbai",
  activeLayers: defaultLayers,

  fetchRadarTiles: async () => {
    set({ loading: true, error: null });
    try {
      get().applyRadarUpdate(unwrap<RadarTilesPayload>(await radarService.tiles()));
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: normalizeError(error) });
    }
  },

  fetchOverlay: async () => {
    try {
      get().applyWeatherOverlayUpdate(unwrap<RadarOverlay>(await radarService.overlay()));
    } catch (error) {
      set({ error: normalizeError(error) });
    }
  },

  fetchFloodRisk: async (district) => {
    try {
      get().applyFloodRiskUpdate(unwrap<FloodRiskZone[]>(await radarService.floodRisk(district)));
    } catch (error) {
      set({ error: normalizeError(error) });
    }
  },

  fetchStormTracking: async () => {
    try {
      get().applyStormUpdate(unwrap<StormTrack[]>(await radarService.stormTracking()));
    } catch (error) {
      set({ error: normalizeError(error) });
    }
  },

  fetchSeverity: async (district = get().selectedDistrict) => {
    try {
      set({ rainIntensity: unwrap<RainIntensity>(await radarService.severity(district)), selectedDistrict: district });
    } catch (error) {
      set({ error: normalizeError(error) });
    }
  },

  fetchDistrictRadar: async (district) => {
    set({ loading: true, error: null, selectedDistrict: district });
    try {
      const payload = unwrap<DistrictRadar>(await radarService.district(district));
      set((state) => ({
        loading: false,
        rainIntensity: payload.rainIntensity,
        stormTracking: payload.stormTracking.length > 0 ? payload.stormTracking : state.stormTracking,
        floodRisk: payload.floodRisk ? [payload.floodRisk, ...state.floodRisk.filter((zone) => zone.district !== payload.district)] : state.floodRisk,
        districtSeverity: { ...state.districtSeverity, [payload.district]: payload.operationalRisk },
        operationalRisk: [payload.operationalRisk, ...state.operationalRisk.filter((risk) => risk.district !== payload.district)],
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      set({ loading: false, error: normalizeError(error) });
    }
  },

  toggleLayer: (layer) => set((state) => ({ activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] } })),

  applyRadarUpdate: (payload) =>
    set({
      radarFrames: payload.past,
      forecastFrames: payload.forecast,
      lastUpdated: new Date().toISOString()
    }),

  applyStormUpdate: (payload) => set({ stormTracking: payload, lastUpdated: new Date().toISOString() }),

  applyFloodRiskUpdate: (payload) => set({ floodRisk: payload, lastUpdated: new Date().toISOString() }),

  applyDistrictRiskUpdate: (payload) =>
    set({
      operationalRisk: payload,
      districtSeverity: Object.fromEntries(payload.map((risk) => [risk.district, risk])),
      lastUpdated: new Date().toISOString()
    }),

  applyWeatherOverlayUpdate: (payload) => {
    if ("layers" in payload) {
      set({
        mapOverlays: payload,
        stormTracking: payload.layers.stormMovement,
        floodRisk: payload.layers.floodRisk,
        lastUpdated: new Date().toISOString()
      });
      return;
    }
    get().applyRadarUpdate(payload);
  },

  applyRainfallAlert: (payload) => set((state) => ({ alerts: [payload, ...state.alerts].slice(0, 30), lastUpdated: new Date().toISOString() }))
}));
