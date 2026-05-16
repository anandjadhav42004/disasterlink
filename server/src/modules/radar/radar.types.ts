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

export interface RainViewerMapResponse {
  version?: string;
  generated?: number;
  host?: string;
  radar?: {
    past?: Array<{ time: number; path: string }>;
    nowcast?: Array<{ time: number; path: string }>;
  };
  satellite?: {
    infrared?: Array<{ time: number; path: string }>;
  };
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

export interface RadarOverlay {
  generatedAt: string;
  layers: {
    rainRadar: RainViewerFrame[];
    cloudCoverage: RadarOverlayMarker[];
    stormMovement: StormTrack[];
    floodRisk: FloodRiskZonePayload[];
    weatherSeverity: RadarOverlayMarker[];
    incidentHeatmap: RadarOverlayMarker[];
    evacuationZones: RadarOverlayMarker[];
  };
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

export interface RainIntensity {
  district: string;
  coordinates: Coordinates;
  intensity: number;
  rainfallMmHr: number;
  severity: RadarRiskLevel;
  source: "rainviewer-weatherstack-fusion";
  observedAt: string;
}

export interface FloodRiskZonePayload {
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

export interface OperationalRiskInput {
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
}

export interface OperationalRiskScore extends OperationalRiskInput {
  score: number;
  level: RadarRiskLevel;
  recommendations: string[];
  calculatedAt: string;
}

export interface DistrictRadarPayload {
  district: string;
  state: string;
  coordinates: Coordinates;
  latestFrame: RainViewerFrame | null;
  rainIntensity: RainIntensity;
  floodRisk: FloodRiskZonePayload | null;
  stormTracking: StormTrack[];
  operationalRisk: OperationalRiskScore;
}

export interface RadarAlertPayload {
  title: string;
  message: string;
  district: string;
  state: string;
  severity: RadarRiskLevel;
  type: "RAINFALL" | "FLOOD" | "STORM" | "DISTRICT_RISK";
  coordinates: Coordinates;
  triggers: string[];
  recommendedActions: string[];
  createdAt: string;
}
