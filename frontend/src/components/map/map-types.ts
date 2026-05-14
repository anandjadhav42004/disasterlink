// ============================================
// Map-specific Types
// ============================================

export type MapLayer = "street" | "satellite" | "terrain";

export interface MapTileConfig {
  name: string;
  url: string;
  attribution: string;
  maxZoom?: number;
}

export const TILE_LAYERS: Record<MapLayer, MapTileConfig> = {
  street: {
    name: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      '&copy; <a href="https://www.esri.com/">Esri</a> — World Imagery',
    maxZoom: 18,
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    maxZoom: 17,
  },
};

export type SOSSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type SOSPinStatus = "PENDING" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED";

export interface SOSPin {
  id: string;
  type: string;
  severity: SOSSeverity;
  status: SOSPinStatus;
  description?: string;
  latitude: number;
  longitude: number;
  userName: string;
  createdAt: string;
}

export interface ShelterPin {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  availableSpace: number;
}

export type HeatmapPoint = [number, number, number]; // [lat, lng, intensity]

// Socket.IO map-update event payloads
export interface MapUpdateNewSOS {
  type: "NEW_SOS";
  data: SOSPin;
}

export interface MapUpdateSOSResolved {
  type: "SOS_RESOLVED";
  data: { id: string };
}

export type MapUpdateEvent = MapUpdateNewSOS | MapUpdateSOSResolved;
