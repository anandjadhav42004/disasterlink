"use client";

import { create } from "zustand";
import { weatherService } from "@/services";

export type WeatherSeverity = "SAFE" | "MODERATE" | "SEVERE" | "CRITICAL";

export interface DisasterWeather {
  city: string;
  district: string;
  country: string;
  coordinates: { lat: number; lng: number };
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  condition: string;
  icon?: string;
  severity: WeatherSeverity;
  rainfallProbability: number;
  updatedAt: string;
  provider?: string;
  risks?: string[];
  recommendedActions?: string[];
}

export interface WeatherForecastDay {
  date: string;
  minTemperature?: number;
  maxTemperature?: number;
  averageTemperature?: number;
  rainfallProbability?: number;
  condition?: string;
  severity: WeatherSeverity;
}

export interface WeatherAlert {
  id?: string;
  title: string;
  message: string;
  city?: string;
  district?: string;
  severity: WeatherSeverity;
  type?: string;
  createdAt?: string;
}

export interface WeatherOverlayMarker {
  id: string;
  city: string;
  district: string;
  coordinates: { lat: number; lng: number };
  severity: WeatherSeverity;
  value: number;
  label: string;
  type: string;
}

export interface WeatherMapOverlay {
  generatedAt: string;
  layers: {
    rainfall: WeatherOverlayMarker[];
    storms: WeatherOverlayMarker[];
    heatZones: WeatherOverlayMarker[];
    floodRisk: WeatherOverlayMarker[];
    cycloneZones: WeatherOverlayMarker[];
    severityMarkers: WeatherOverlayMarker[];
  };
}

type ApiEnvelope<T> = { data: { data: T } };

export const WEATHER_WATCHLIST = [
  "Mumbai",
  "Delhi",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Guwahati",
  "Bhubaneswar",
  "Kochi"
];

interface WeatherState {
  currentWeather: DisasterWeather | null;
  forecast: WeatherForecastDay[];
  alerts: WeatherAlert[];
  districtWeather: Record<string, DisasterWeather>;
  mapWeatherOverlay: WeatherMapOverlay | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  lastWatchlistRefresh: string | null;
  selectedDistrict: string;
  fetchCurrentWeather: (city?: string) => Promise<void>;
  fetchWeatherWatchlist: (cities?: string[]) => Promise<void>;
  fetchForecast: (city?: string) => Promise<void>;
  fetchAlerts: (city?: string) => Promise<void>;
  fetchDistrictWeather: (district: string, coordinates?: { lat: number; lng: number; displayName?: string }) => Promise<void>;
  fetchMapWeatherOverlay: () => Promise<void>;
  setSelectedDistrict: (district: string) => void;
  applyWeatherUpdate: (weather: DisasterWeather) => void;
  applyBackgroundWeatherUpdate: (weather: DisasterWeather) => void;
  applyWeatherAlert: (alert: WeatherAlert) => void;
  applyWeatherOverlay: (overlay: WeatherMapOverlay) => void;
}

function unwrap<T>(response: ApiEnvelope<T>) {
  return response.data.data;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("timeout")) {
      return "Weather provider is responding slowly. Showing last available operational data.";
    }
    return error.message;
  }
  return "Weather intelligence is temporarily unavailable.";
}

function weatherKey(weather: DisasterWeather) {
  const district = weather.district || weather.city;
  return `${district.toLowerCase()}:${weather.coordinates.lat.toFixed(3)}:${weather.coordinates.lng.toFixed(3)}`;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  currentWeather: null,
  forecast: [],
  alerts: [],
  districtWeather: {},
  mapWeatherOverlay: null,
  loading: false,
  error: null,
  lastUpdated: null,
  lastWatchlistRefresh: null,
  selectedDistrict: "Mumbai",

  fetchCurrentWeather: async (city = get().selectedDistrict || "Mumbai") => {
    set({ loading: true, error: null });
    try {
      const weather = unwrap<DisasterWeather>(await weatherService.current(city));
      get().applyWeatherUpdate(weather);
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: normalizeError(error) });
    }
  },

  fetchWeatherWatchlist: async (cities = WEATHER_WATCHLIST) => {
    const state = get();
    const refreshedAt = state.lastWatchlistRefresh ? new Date(state.lastWatchlistRefresh).getTime() : 0;
    const hasRecentData = Date.now() - refreshedAt < 60_000 && Object.keys(state.districtWeather).length >= Math.min(3, cities.length);
    if (hasRecentData) return;

    set({ loading: true, error: null });
    let fulfilled = 0;

    for (const city of cities) {
      try {
        const response = await weatherService.current(city);
        get().applyBackgroundWeatherUpdate(unwrap<DisasterWeather>(response as ApiEnvelope<DisasterWeather>));
        fulfilled += 1;
      } catch {
        // Keep loading the rest of the watchlist; the backend may still have cached snapshots for later cities.
      }
    }

    set({
      loading: false,
      lastWatchlistRefresh: new Date().toISOString(),
      error: fulfilled === 0 ? "Weather watchlist could not be loaded." : null
    });
  },

  fetchForecast: async (city = get().selectedDistrict || "Mumbai") => {
    try {
      const payload = unwrap<{ forecast: WeatherForecastDay[] }>(await weatherService.forecast(city));
      set({ forecast: payload.forecast ?? [] });
    } catch (error) {
      set({ forecast: [], error: normalizeError(error) });
    }
  },

  fetchAlerts: async (city = get().selectedDistrict || "Mumbai") => {
    try {
      const payload = unwrap<{ active?: WeatherAlert[]; generated?: WeatherAlert[] }>(await weatherService.alerts(city));
      set({ alerts: [...(payload.generated ?? []), ...(payload.active ?? [])] });
    } catch (error) {
      set({ error: normalizeError(error) });
    }
  },

  fetchDistrictWeather: async (district, coordinates) => {
    set({ loading: true, error: null, selectedDistrict: district });
    try {
      const weather = unwrap<DisasterWeather>(await weatherService.district(district, coordinates));
      get().applyWeatherUpdate(
        coordinates
          ? {
              ...weather,
              city: coordinates.displayName ?? weather.city,
              district: coordinates.displayName ?? weather.district,
              coordinates: { lat: coordinates.lat, lng: coordinates.lng }
            }
          : weather
      );
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: normalizeError(error) });
    }
  },

  fetchMapWeatherOverlay: async () => {
    try {
      const overlay = unwrap<WeatherMapOverlay>(await weatherService.mapOverlay());
      set({ mapWeatherOverlay: overlay });
    } catch (error) {
      set({ error: normalizeError(error) });
    }
  },

  setSelectedDistrict: (district) => set({ selectedDistrict: district }),

  applyWeatherUpdate: (weather) =>
    set((state) => ({
      currentWeather: weather,
      districtWeather: { ...state.districtWeather, [weatherKey(weather)]: weather },
      lastUpdated: new Date().toISOString()
    })),

  applyBackgroundWeatherUpdate: (weather) =>
    set((state) => ({
      districtWeather: { ...state.districtWeather, [weatherKey(weather)]: weather },
      lastUpdated: new Date().toISOString()
    })),

  applyWeatherAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 20),
      lastUpdated: new Date().toISOString()
    })),

  applyWeatherOverlay: (overlay) => set({ mapWeatherOverlay: overlay, lastUpdated: new Date().toISOString() })
}));
