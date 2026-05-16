"use client";

import { create } from "zustand";

export type WeatherTileLayer = "" | "radar" | "precipitation" | "clouds" | "temperature" | "wind" | "pressure";
export type WeatherUnits = "metric" | "imperial";
export type OperationalToggle = "radar" | "rainfall" | "wind" | "floodRisk" | "sos" | "volunteers" | "shelters" | "heatmap";

export interface RealtimeOperationalAlert {
  id: string;
  title: string;
  message: string;
  severity: "SAFE" | "MODERATE" | "SEVERE" | "CRITICAL" | string;
  createdAt: string;
}

interface OperationalWeatherMapState {
  selectedCity: string;
  searchQuery: string;
  units: WeatherUnits;
  activeWeatherLayer: WeatherTileLayer;
  layerOpacity: number;
  mapCenter: { lat: number; lng: number; zoom: number };
  operationalToggles: Record<OperationalToggle, boolean>;
  realtimeAlerts: RealtimeOperationalAlert[];
  setSelectedCity: (city: string) => void;
  setSearchQuery: (query: string) => void;
  setUnits: (units: WeatherUnits) => void;
  setActiveWeatherLayer: (layer: WeatherTileLayer) => void;
  setLayerOpacity: (opacity: number) => void;
  setMapCenter: (center: { lat: number; lng: number; zoom?: number }) => void;
  toggleOperationalLayer: (layer: OperationalToggle) => void;
  pushRealtimeAlert: (alert: Omit<RealtimeOperationalAlert, "id" | "createdAt"> & Partial<Pick<RealtimeOperationalAlert, "id" | "createdAt">>) => void;
}

export const useOperationalWeatherMapStore = create<OperationalWeatherMapState>((set) => ({
  selectedCity: "Mumbai",
  searchQuery: "Mumbai",
  units: "metric",
  activeWeatherLayer: "",
  layerOpacity: 0.72,
  mapCenter: { lat: 19.076, lng: 72.8777, zoom: 8 },
  operationalToggles: {
    radar: true,
    rainfall: true,
    wind: true,
    floodRisk: true,
    sos: true,
    volunteers: true,
    shelters: true,
    heatmap: true
  },
  realtimeAlerts: [],
  setSelectedCity: (city) => set({ selectedCity: city, searchQuery: city }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setUnits: (units) => set({ units }),
  setActiveWeatherLayer: (layer) => set({ activeWeatherLayer: layer }),
  setLayerOpacity: (opacity) => set({ layerOpacity: opacity }),
  setMapCenter: ({ lat, lng, zoom }) =>
    set((state) => ({
      mapCenter: { lat, lng, zoom: zoom ?? state.mapCenter.zoom }
    })),
  toggleOperationalLayer: (layer) =>
    set((state) => ({
      operationalToggles: { ...state.operationalToggles, [layer]: !state.operationalToggles[layer] }
    })),
  pushRealtimeAlert: (alert) =>
    set((state) => ({
      realtimeAlerts: [
        {
          id: alert.id ?? `${alert.title}-${Date.now()}`,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          createdAt: alert.createdAt ?? new Date().toISOString()
        },
        ...state.realtimeAlerts
      ].slice(0, 20)
    }))
}));
