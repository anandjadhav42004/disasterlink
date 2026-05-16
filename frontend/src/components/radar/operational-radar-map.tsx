"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DivIcon, Layer, LayerGroup, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AlertTriangle, Cloud, CloudRain, CloudSun, LocateFixed, RefreshCw, Search, ShieldAlert, Sun, Wind, Zap, Wifi } from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { mapService } from "@/services";
import { useOperationalWeatherMapStore, type OperationalToggle, type WeatherTileLayer, type WeatherUnits } from "@/store/operational-weather-map-store";
import { useRadarStore, type FloodRiskZone, type OperationalRisk, type RadarAlert, type StormTrack } from "@/store/radar-store";
import { useWeatherStore, type DisasterWeather, type WeatherAlert, type WeatherForecastDay, type WeatherMapOverlay } from "@/store/weather-store";

type LeafletModule = typeof import("leaflet");
type ApiEnvelope<T> = { data: { data: T } };

interface LiveIncident {
  id: string;
  type: string;
  severity: string;
  status: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface LiveShelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
}

interface LiveVolunteer {
  id: string;
  isAvailable: boolean;
  user: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

interface LiveMapData {
  incidents: LiveIncident[];
  shelters: LiveShelter[];
  volunteers: LiveVolunteer[];
}

const DEFAULT_LIVE_DATA: LiveMapData = { incidents: [], shelters: [], volunteers: [] };
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const WEATHER_LAYER_OPTIONS: Array<{ id: WeatherTileLayer; label: string }> = [
  { id: "", label: "None (base map)" },
  { id: "radar", label: "Radar" },
  { id: "precipitation", label: "Precipitation" },
  { id: "clouds", label: "Clouds" },
  { id: "temperature", label: "Temperature" },
  { id: "wind", label: "Wind" },
  { id: "pressure", label: "Pressure" }
];

const OPENWEATHER_TILE_LAYER_IDS: Partial<Record<WeatherTileLayer, string>> = {
  precipitation: "precipitation_new",
  clouds: "clouds_new",
  temperature: "temp_new",
  wind: "wind_new",
  pressure: "pressure_new"
};

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.replace(/^"|"$/g, "").trim();

const OPERATIONAL_TOGGLES: Array<{ id: OperationalToggle; label: string }> = [
  { id: "radar", label: "Radar" },
  { id: "rainfall", label: "Rainfall" },
  { id: "wind", label: "Wind" },
  { id: "floodRisk", label: "Flood Risk" },
  { id: "sos", label: "SOS" },
  { id: "volunteers", label: "Volunteers" },
  { id: "shelters", label: "Shelters" },
  { id: "heatmap", label: "Heatmap" }
];

function unwrap<T>(response: ApiEnvelope<T>) {
  return response.data.data;
}

interface OpenWeatherGeocodeHit {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

async function geocodePlace(query: string) {
  if (!OPENWEATHER_API_KEY) return null;
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${OPENWEATHER_API_KEY}`);
  if (!response.ok) return null;
  const [hit] = (await response.json()) as OpenWeatherGeocodeHit[];
  if (!hit || !Number.isFinite(hit.lat) || !Number.isFinite(hit.lon)) return null;
  const displayName = [hit.name, hit.state, hit.country].filter(Boolean).join(", ");
  return { lat: hit.lat, lng: hit.lon, displayName: displayName || query };
}

function severityColor(severity?: string) {
  const normalized = severity?.toUpperCase();
  if (normalized === "CRITICAL") return "#ef4444";
  if (normalized === "SEVERE" || normalized === "HIGH") return "#f97316";
  if (normalized === "MODERATE" || normalized === "MEDIUM") return "#facc15";
  return "#22d3ee";
}

function severityClass(severity?: string) {
  const normalized = severity?.toUpperCase();
  if (normalized === "CRITICAL") return "border-red-300 bg-red-50 text-red-950";
  if (normalized === "SEVERE" || normalized === "HIGH") return "border-orange-300 bg-orange-50 text-orange-950";
  if (normalized === "MODERATE" || normalized === "MEDIUM") return "border-amber-300 bg-amber-50 text-amber-950";
  return "border-emerald-300 bg-emerald-50 text-emerald-950";
}

function isActionableAlert(alert: { title: string; message: string; severity?: string }) {
  const severity = alert.severity?.toUpperCase();
  const text = `${alert.title} ${alert.message}`.toLowerCase();
  if (alert.title.toLowerCase() === "weather update") return false;
  if (text.includes("temporarily unavailable")) return false;
  if (severity === "CRITICAL" || severity === "SEVERE" || severity === "HIGH") return true;
  if (text.includes("sos") || text.includes("flood") || text.includes("storm") || text.includes("evacuation")) return true;
  return severity === "MODERATE";
}

function weatherCode(condition?: string, severity?: string) {
  const text = `${condition ?? ""} ${severity ?? ""}`.toLowerCase();
  if (text.includes("storm") || text.includes("thunder") || text.includes("critical")) return "storm";
  if (text.includes("rain") || text.includes("drizzle")) return "rain";
  if (text.includes("cloud") || text.includes("haze") || text.includes("mist") || text.includes("fog")) return "cloud";
  if (text.includes("wind")) return "wind";
  if (text.includes("clear") || text.includes("sun")) return "clear";
  return "partly";
}

function weatherLabel(condition?: string, severity?: string) {
  const code = weatherCode(condition, severity);
  if (code === "storm") return "Storm";
  if (code === "rain") return "Rain";
  if (code === "cloud") return "Cloudy";
  if (code === "wind") return "Wind";
  if (code === "clear") return "Clear";
  return "Mixed";
}

function weatherMarkerText(condition?: string, severity?: string) {
  const code = weatherCode(condition, severity);
  if (code === "storm") return "!";
  if (code === "rain") return "RN";
  if (code === "cloud") return "CL";
  if (code === "wind") return "W";
  if (code === "clear") return "SUN";
  return "SKY";
}

function WeatherGlyph({ condition, severity, className }: { condition?: string; severity?: string; className?: string }) {
  const code = weatherCode(condition, severity);
  const iconClass = cn("mx-auto h-8 w-8", className);
  if (code === "storm") return <Zap className={iconClass} />;
  if (code === "rain") return <CloudRain className={iconClass} />;
  if (code === "cloud") return <Cloud className={iconClass} />;
  if (code === "wind") return <Wind className={iconClass} />;
  if (code === "clear") return <Sun className={iconClass} />;
  return <CloudSun className={iconClass} />;
}

function formatTemp(value?: number, units: WeatherUnits = "metric") {
  if (value == null || Number.isNaN(value)) return "--";
  return `${Math.round(value)}${units === "metric" ? "C" : "F"}`;
}

function formatWind(value?: number, units: WeatherUnits = "metric") {
  if (value == null || Number.isNaN(value)) return "--";
  return units === "metric" ? `${Math.round(value)} km/h` : `${Math.round(value * 0.621371)} mph`;
}

function createDivIcon(leaflet: LeafletModule, className: string, html: string, size: [number, number] = [26, 26], anchor: [number, number] = [size[0] / 2, size[1] / 2]) {
  return leaflet.divIcon({
    className,
    html,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]]
  }) as DivIcon;
}

function safeRemoveLayer(map: LeafletMap | null, layer: Layer | null | undefined) {
  if (!map || !layer) return;
  try {
    if (map.hasLayer(layer)) map.removeLayer(layer);
  } catch {
    // Leaflet can throw if a tile/marker is mid-render while the map is being destroyed.
  }
}

function chartData(forecast: WeatherForecastDay[], currentWeather: DisasterWeather | null) {
  const base: WeatherForecastDay[] = forecast.length > 0 ? forecast : Array.from({ length: 5 }, (_, index) => ({
    date: new Date(Date.now() + index * 86_400_000).toISOString(),
    minTemperature: (currentWeather?.temperature ?? 28) + Math.sin(index) * 2 - 2,
    maxTemperature: (currentWeather?.temperature ?? 28) + Math.sin(index) * 2 + 3,
    averageTemperature: (currentWeather?.temperature ?? 28) + Math.sin(index) * 2,
    rainfallProbability: Math.max(8, (currentWeather?.rainfallProbability ?? 36) + index * 4),
    severity: currentWeather?.severity ?? "MODERATE"
  }));

  return base.slice(0, 5).map((day, index) => {
    const label = new Date(day.date).toLocaleDateString(undefined, { weekday: "short" });
    const temp = day.averageTemperature ?? ((day.minTemperature ?? 24) + (day.maxTemperature ?? 30)) / 2;
    return {
      label,
      temperature: Math.round(temp),
      rainfall: Math.round(day.rainfallProbability ?? 20 + index * 7),
      humidity: Math.min(96, Math.max(34, Math.round((currentWeather?.humidity ?? 68) + index * 3 - 6))),
      wind: Math.round((currentWeather?.windSpeed ?? 18) + index * 1.8),
      severity: day.severity
    };
  });
}

function forecastCards(forecast: WeatherForecastDay[], currentWeather: DisasterWeather | null) {
  return chartData(forecast, currentWeather).map((day) => ({
    ...day,
    range: `${day.temperature - 2} / ${day.temperature + 3}`
  }));
}

export function OperationalRadarMap() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapAliveRef = useRef(false);
  const cityMarkerRef = useRef<Marker | null>(null);
  const weatherLayerRef = useRef<Layer | null>(null);
  const operationalLayersRef = useRef<Partial<Record<OperationalToggle, LayerGroup>>>({});
  const [mapReady, setMapReady] = useState(false);
  const [liveData, setLiveData] = useState<LiveMapData>(DEFAULT_LIVE_DATA);
  const [loadingLive, setLoadingLive] = useState(true);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const { isConnected, on, emit } = useSocket();

  const {
    selectedCity,
    searchQuery,
    units,
    activeWeatherLayer,
    layerOpacity,
    mapCenter,
    operationalToggles,
    realtimeAlerts,
    setSelectedCity,
    setSearchQuery,
    setUnits,
    setActiveWeatherLayer,
    setLayerOpacity,
    setMapCenter,
    toggleOperationalLayer,
    pushRealtimeAlert
  } = useOperationalWeatherMapStore();
  const initialMapCenterRef = useRef(mapCenter);

  const {
    currentWeather,
    forecast,
    alerts: weatherAlerts,
    districtWeather,
    mapWeatherOverlay,
    fetchForecast,
    fetchAlerts,
    fetchDistrictWeather,
    fetchMapWeatherOverlay,
    applyBackgroundWeatherUpdate,
    applyWeatherAlert,
    applyWeatherOverlay
  } = useWeatherStore();

  const {
    radarFrames,
    forecastFrames,
    floodRisk,
    stormTracking,
    operationalRisk,
    mapOverlays,
    alerts: radarAlerts,
    lastUpdated,
    loading: radarLoading,
    error: radarError,
    fetchRadarTiles,
    fetchOverlay,
    fetchFloodRisk,
    fetchStormTracking,
    fetchSeverity,
    applyRadarUpdate,
    applyStormUpdate,
    applyFloodRiskUpdate,
    applyDistrictRiskUpdate,
    applyWeatherOverlayUpdate,
    applyRainfallAlert
  } = useRadarStore();

  const frames = useMemo(() => {
    const merged = [...radarFrames, ...forecastFrames];
    return merged.length > 0 ? merged : mapOverlays?.layers.rainRadar ?? [];
  }, [forecastFrames, mapOverlays, radarFrames]);

  const activeFrame = frames[Math.min(activeFrameIndex, Math.max(0, frames.length - 1))];
  const activeIncidents = useMemo(() => liveData.incidents.filter((incident) => !["RESOLVED", "CANCELLED"].includes(incident.status)), [liveData.incidents]);
  const highestRisk = useMemo(() => [...operationalRisk].sort((a, b) => b.score - a.score)[0], [operationalRisk]);
  const cards = useMemo(() => forecastCards(forecast, currentWeather), [currentWeather, forecast]);
  const charts = useMemo(() => chartData(forecast, currentWeather), [currentWeather, forecast]);
  const isLight = true;
  const allAlerts = useMemo(() => [...realtimeAlerts, ...radarAlerts, ...weatherAlerts].slice(0, 6), [radarAlerts, realtimeAlerts, weatherAlerts]);
  const actionableAlerts = useMemo(() => allAlerts.filter(isActionableAlert).slice(0, 6), [allAlerts]);
  const featuredAlert = useMemo(
    () =>
      actionableAlerts.find((alert) => {
        const severity = alert.severity?.toUpperCase();
        return severity === "CRITICAL" || severity === "SEVERE" || alert.title.toLowerCase().includes("sos");
      }),
    [actionableAlerts]
  );

  const loadLiveMap = useCallback(async () => {
    setLoadingLive(true);
    try {
      const payload = unwrap<LiveMapData>(await mapService.getLive());
      setLiveData(payload ?? DEFAULT_LIVE_DATA);
    } catch {
      toast.error("Live operational map feed unavailable");
    } finally {
      setLoadingLive(false);
    }
  }, []);

  const loadCity = useCallback(async (city: string) => {
    const safeCity = city.trim() || "Mumbai";
    const geocoded = await geocodePlace(safeCity);
    if (!geocoded) {
      toast.error("Location not found", { description: "The map will keep the previous valid location." });
      return;
    }
    setSelectedCity(geocoded.displayName);
    setMapCenter({ lat: geocoded.lat, lng: geocoded.lng, zoom: 8 });
    if (mapRef.current && mapAliveRef.current) mapRef.current.setView([geocoded.lat, geocoded.lng], 8);
    await Promise.allSettled([
      fetchDistrictWeather(geocoded.displayName, { lat: geocoded.lat, lng: geocoded.lng, displayName: geocoded.displayName }),
      fetchForecast(geocoded.displayName),
      fetchAlerts(geocoded.displayName),
      fetchSeverity(geocoded.displayName)
    ]);
    const nextWeather = useWeatherStore.getState().currentWeather;
    if (nextWeather?.coordinates) {
      const { lat, lng } = nextWeather.coordinates;
      setMapCenter({ lat, lng, zoom: 9 });
      if (mapRef.current && mapAliveRef.current) mapRef.current.setView([lat, lng], 9);
    }
  }, [fetchAlerts, fetchDistrictWeather, fetchForecast, fetchSeverity, setMapCenter, setSelectedCity]);

  const refreshAll = useCallback(async () => {
    const selectedWeather = useWeatherStore.getState().currentWeather;
    await Promise.allSettled([
      selectedCity === "Current Location" && selectedWeather?.coordinates
        ? fetchDistrictWeather("Current Location", { ...selectedWeather.coordinates, displayName: "Current Location" })
        : loadCity(selectedCity),
      loadLiveMap(),
      fetchRadarTiles(),
      fetchOverlay(),
      fetchFloodRisk(),
      fetchStormTracking(),
      fetchMapWeatherOverlay()
    ]);
  }, [fetchDistrictWeather, fetchFloodRisk, fetchMapWeatherOverlay, fetchOverlay, fetchRadarTiles, fetchStormTracking, loadCity, loadLiveMap, selectedCity]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAll();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshAll]);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;

    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !mapEl.current) return;
      leafletRef.current = leaflet;
      const initialCenter = initialMapCenterRef.current;

      const map = leaflet.map(mapEl.current, {
        zoomControl: true,
        preferCanvas: true
      });

      mapRef.current = map;
      mapAliveRef.current = true;
      map.setView([initialCenter.lat, initialCenter.lng], initialCenter.zoom);
      leaflet
        .tileLayer(OSM_TILE_URL, {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors"
        })
        .addTo(map);

      map.on("click", (event) => {
        const label = `${event.latlng.lat.toFixed(3)}, ${event.latlng.lng.toFixed(3)}`;
        setSelectedCity(label);
        setMapCenter({ lat: event.latlng.lat, lng: event.latlng.lng, zoom: map.getZoom() });
        void fetchDistrictWeather(label, { lat: event.latlng.lat, lng: event.latlng.lng });
      });

      setMapReady(true);
    });

    return () => {
      cancelled = true;
      const map = mapRef.current;
      mapAliveRef.current = false;
      setMapReady(false);
      safeRemoveLayer(map, cityMarkerRef.current);
      safeRemoveLayer(map, weatherLayerRef.current);
      for (const layer of Object.values(operationalLayersRef.current)) {
        safeRemoveLayer(map, layer);
      }
      cityMarkerRef.current = null;
      weatherLayerRef.current = null;
      operationalLayersRef.current = {};
      try {
        map?.off();
        map?.remove();
      } catch {
        // Ignore teardown races in development refresh/navigation.
      }
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, [fetchDistrictWeather, setMapCenter, setSelectedCity]);

  useEffect(() => {
    if (!frames.length) return;
    const timer = window.setInterval(() => {
      setActiveFrameIndex((index) => (index + 1) % frames.length);
    }, 1100);
    return () => window.clearInterval(timer);
  }, [frames.length]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !mapReady || !mapAliveRef.current) return;

    safeRemoveLayer(map, cityMarkerRef.current);
    const coordinates = currentWeather?.coordinates ?? { lat: mapCenter.lat, lng: mapCenter.lng };
    cityMarkerRef.current = leaflet
      .marker([coordinates.lat, coordinates.lng], {
        icon: createDivIcon(leaflet, "dl-city-marker", `<div class="dl-map-pin"><div class="dl-map-pin-head"><span>${weatherMarkerText(currentWeather?.condition, currentWeather?.severity)}</span></div><div class="dl-map-pin-tip"></div></div>`, [42, 52], [21, 43])
      })
      .bindPopup(`<strong>${selectedCity}</strong><br/>${currentWeather?.condition ?? "Operational weather target"}`)
      .addTo(map);
  }, [currentWeather, mapCenter.lat, mapCenter.lng, mapReady, selectedCity]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !mapReady || !mapAliveRef.current) return;

    if (weatherLayerRef.current) {
      safeRemoveLayer(map, weatherLayerRef.current);
      weatherLayerRef.current = null;
    }
    if (!activeWeatherLayer) return;
    const enabledByOperationalToggle =
      (activeWeatherLayer === "radar" && operationalToggles.radar) ||
      (activeWeatherLayer === "precipitation" && operationalToggles.rainfall) ||
      (activeWeatherLayer === "wind" && operationalToggles.wind) ||
      !["radar", "precipitation", "wind"].includes(activeWeatherLayer);
    if (!enabledByOperationalToggle) return;

    if (activeWeatherLayer === "radar" && activeFrame?.tileUrl) {
      const tile = leaflet.tileLayer(activeFrame.tileUrl, {
        opacity: layerOpacity,
        maxNativeZoom: 8,
        maxZoom: 19,
        keepBuffer: 2,
        updateWhenZooming: false,
        zIndex: 450,
        attribution: "Radar tiles RainViewer"
      }) as TileLayer;
      tile.addTo(map);
      weatherLayerRef.current = tile;
      return;
    }

    const openWeatherLayerId = OPENWEATHER_TILE_LAYER_IDS[activeWeatherLayer];
    if (openWeatherLayerId && OPENWEATHER_API_KEY) {
      const tile = leaflet.tileLayer(`https://tile.openweathermap.org/map/${openWeatherLayerId}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`, {
        opacity: layerOpacity,
        maxNativeZoom: 10,
        maxZoom: 19,
        keepBuffer: 2,
        updateWhenZooming: false,
        zIndex: 440,
        attribution: "Weather tiles OpenWeather"
      }) as TileLayer;
      tile.addTo(map);
      weatherLayerRef.current = tile;
      return;
    }

    if (activeWeatherLayer === "precipitation" && activeFrame?.tileUrl) {
      const tile = leaflet.tileLayer(activeFrame.tileUrl, {
        opacity: layerOpacity,
        maxNativeZoom: 8,
        maxZoom: 19,
        keepBuffer: 2,
        updateWhenZooming: false,
        zIndex: 440,
        attribution: "Precipitation radar RainViewer"
      }) as TileLayer;
      tile.addTo(map);
      weatherLayerRef.current = tile;
      return;
    }

    const group = leaflet.layerGroup();
    const weatherPoints = Object.values(districtWeather);
    const severityMarkers = mapWeatherOverlay?.layers.severityMarkers ?? [];
    const cloudMarkers = mapOverlays?.layers.cloudCoverage ?? [];
    const sourcePoints = weatherPoints.length > 0 ? weatherPoints : [];

    if (activeWeatherLayer === "clouds") {
      for (const marker of cloudMarkers.length ? cloudMarkers : severityMarkers) {
        leaflet.circle([marker.coordinates.lat, marker.coordinates.lng], {
          radius: Math.max(18_000, marker.value * 950),
          color: "#cbd5e1",
          fillColor: "#94a3b8",
          fillOpacity: layerOpacity * 0.28,
          opacity: layerOpacity * 0.55,
          weight: 1
        }).bindPopup(`<strong>${"city" in marker ? marker.city : marker.district}</strong><br/>${marker.label}`).addTo(group);
      }
    }

    if (activeWeatherLayer === "temperature") {
      for (const weather of sourcePoints) {
        leaflet.circle([weather.coordinates.lat, weather.coordinates.lng], {
          radius: Math.max(24_000, Math.abs(weather.temperature) * 1200),
          color: severityColor(weather.severity),
          fillColor: severityColor(weather.severity),
          fillOpacity: layerOpacity * 0.34,
          opacity: layerOpacity,
          weight: 1
        }).bindPopup(`<strong>${weather.city}</strong><br/>Temperature ${formatTemp(weather.temperature, units)}<br/>${weather.condition}`).addTo(group);
      }
    }

    if (activeWeatherLayer === "wind") {
      for (const weather of sourcePoints) {
        leaflet.marker([weather.coordinates.lat, weather.coordinates.lng], {
          icon: createDivIcon(leaflet, "dl-wind-marker", `<div class="dl-vector-marker">W<br/><span>${Math.round(weather.windSpeed)}</span></div>`, [42, 42])
        }).bindPopup(`<strong>${weather.city}</strong><br/>Wind ${formatWind(weather.windSpeed, units)}`).addTo(group);
      }
    }

    if (activeWeatherLayer === "pressure") {
      for (const weather of sourcePoints) {
        leaflet.circleMarker([weather.coordinates.lat, weather.coordinates.lng], {
          radius: 10,
          color: "#60a5fa",
          fillColor: "#172554",
          fillOpacity: layerOpacity,
          opacity: layerOpacity,
          weight: 2
        }).bindPopup(`<strong>${weather.city}</strong><br/>Pressure ${weather.pressure} hPa`).addTo(group);
      }
    }

    group.addTo(map);
    weatherLayerRef.current = group;
  }, [activeFrame, activeWeatherLayer, districtWeather, layerOpacity, mapOverlays, mapReady, mapWeatherOverlay, operationalToggles.radar, operationalToggles.rainfall, operationalToggles.wind, units]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !mapReady || !mapAliveRef.current) return;

    for (const layer of Object.values(operationalLayersRef.current)) {
      safeRemoveLayer(map, layer);
    }
    operationalLayersRef.current = {};

    const addGroup = (key: OperationalToggle, build: (group: LayerGroup) => void) => {
      if (!operationalToggles[key]) return;
      const group = leaflet.layerGroup();
      build(group);
      group.addTo(map);
      operationalLayersRef.current[key] = group;
    };

    addGroup("sos", (group) => {
      activeIncidents.forEach((incident) => {
        leaflet
          .marker([incident.latitude, incident.longitude], {
            icon: createDivIcon(leaflet, "dl-sos-marker", `<div class="dl-pulse-red"></div><div class="dl-sos-core">SOS</div>`, [42, 42])
          })
          .bindPopup(`<strong>${incident.type}</strong><br/>${incident.severity}<br/>${incident.description ?? "Live emergency request"}`)
          .addTo(group);
      });
    });

    addGroup("volunteers", (group) => {
      liveData.volunteers.forEach((volunteer) => {
        if (volunteer.user.latitude == null || volunteer.user.longitude == null) return;
        leaflet
          .marker([volunteer.user.latitude, volunteer.user.longitude], {
            icon: createDivIcon(leaflet, "dl-volunteer-marker", `<div class="dl-volunteer-core"></div>`, [24, 24])
          })
          .bindPopup(`<strong>${volunteer.user.name}</strong><br/>${volunteer.isAvailable ? "Available" : "Assigned"}`)
          .addTo(group);
      });
    });

    addGroup("shelters", (group) => {
      liveData.shelters.forEach((shelter) => {
        const occupancy = Math.round((shelter.occupied / Math.max(1, shelter.capacity)) * 100);
        leaflet
          .marker([shelter.latitude, shelter.longitude], {
            icon: createDivIcon(leaflet, "dl-shelter-marker", `<div class="dl-shelter-core"><span style="height:${Math.min(100, occupancy)}%"></span></div>`, [28, 28])
          })
          .bindPopup(`<strong>${shelter.name}</strong><br/>Occupancy ${shelter.occupied}/${shelter.capacity} (${occupancy}%)`)
          .addTo(group);
      });
    });

    addGroup("floodRisk", (group) => {
      floodRisk.forEach((zone) => {
        leaflet
          .circle([zone.coordinates.lat, zone.coordinates.lng], {
            radius: Math.max(30_000, zone.probability * 1200),
            color: severityColor(zone.severity),
            fillColor: severityColor(zone.severity),
            fillOpacity: 0.18,
            opacity: 0.75,
            weight: 2
          })
          .bindPopup(`<strong>${zone.district}</strong><br/>Flood probability ${zone.probability}%<br/>${zone.triggers.join(", ")}`)
          .addTo(group);
      });
    });

    addGroup("heatmap", (group) => {
      [...operationalRisk, ...activeIncidents.map((incident) => ({
        district: incident.type,
        coordinates: { lat: incident.latitude, lng: incident.longitude },
        score: 82,
        level: incident.severity
      } as OperationalRisk))].forEach((risk) => {
        leaflet
          .circle([risk.coordinates.lat, risk.coordinates.lng], {
            radius: Math.max(22_000, risk.score * 900),
            color: severityColor(risk.level),
            fillColor: severityColor(risk.level),
            fillOpacity: 0.11,
            opacity: 0.18,
            weight: 1
          })
          .addTo(group);
      });
    });

    addGroup("wind", (group) => {
      stormTracking.forEach((storm) => {
        const points = [storm.centroid, ...storm.trajectory].map((point) => [point.lat, point.lng] as [number, number]);
        leaflet.polyline(points, { color: severityColor(storm.severity), opacity: 0.9, weight: 3 }).bindPopup(`<strong>${storm.name}</strong><br/>${storm.projectedImpact}`).addTo(group);
      });
    });
  }, [activeIncidents, floodRisk, liveData.shelters, liveData.volunteers, mapReady, operationalRisk, operationalToggles, stormTracking]);

  useEffect(() => {
    const offWeather = on<DisasterWeather>("weather-update", (payload) => {
      applyBackgroundWeatherUpdate(payload);
      pushRealtimeAlert({ title: "Weather update", message: `${payload.city} now ${payload.condition}`, severity: payload.severity });
    });
    const offRadar = on<Parameters<typeof applyRadarUpdate>[0]>("radar-update", applyRadarUpdate);
    const offStorm = on<StormTrack[]>("storm-update", applyStormUpdate);
    const offFlood = on<FloodRiskZone[]>("flood-risk-update", applyFloodRiskUpdate);
    const offDistrictRisk = on<OperationalRisk[]>("district-risk-update", applyDistrictRiskUpdate);
    const offOverlay = on<WeatherMapOverlay | Parameters<typeof applyWeatherOverlayUpdate>[0]>("weather-overlay-update", (payload) => {
      if ("layers" in payload && "severityMarkers" in payload.layers) applyWeatherOverlay(payload as WeatherMapOverlay);
      else applyWeatherOverlayUpdate(payload as Parameters<typeof applyWeatherOverlayUpdate>[0]);
    });
    const offRainfall = on<RadarAlert>("rainfall-alert", (payload) => {
      applyRainfallAlert(payload);
      pushRealtimeAlert({ title: payload.title, message: payload.message, severity: payload.severity, createdAt: payload.createdAt });
    });
    const offSevere = on<WeatherAlert>("weather-alert", (payload) => {
      applyWeatherAlert(payload);
      pushRealtimeAlert({ title: payload.title, message: payload.message, severity: payload.severity, createdAt: payload.createdAt });
    });
    const offSos = on<LiveIncident>("new-sos", (payload) => {
      if (!payload?.id) return;
      setLiveData((state) => ({ ...state, incidents: [payload, ...state.incidents.filter((incident) => incident.id !== payload.id)] }));
      pushRealtimeAlert({ title: "New SOS", message: payload.description ?? payload.type, severity: payload.severity });
    });
    const offVolunteer = on<{ id?: string; userId?: string; latitude: number; longitude: number; name?: string }>("volunteer-location", (payload) => {
      const id = payload.id ?? payload.userId ?? "live-volunteer";
      setLiveData((state) => ({
        ...state,
        volunteers: state.volunteers.some((volunteer) => volunteer.id === id)
          ? state.volunteers.map((volunteer) => volunteer.id === id ? { ...volunteer, user: { ...volunteer.user, latitude: payload.latitude, longitude: payload.longitude } } : volunteer)
          : [{ id, isAvailable: true, user: { id, name: payload.name ?? "Live volunteer", latitude: payload.latitude, longitude: payload.longitude } }, ...state.volunteers]
      }));
    });
    const offShelter = on<LiveShelter>("shelter-update", (payload) => {
      if (!payload?.id) return;
      setLiveData((state) => ({ ...state, shelters: [payload, ...state.shelters.filter((shelter) => shelter.id !== payload.id)] }));
    });

    return () => {
      offWeather();
      offRadar();
      offStorm();
      offFlood();
      offDistrictRisk();
      offOverlay();
      offRainfall();
      offSevere();
      offSos();
      offVolunteer();
      offShelter();
    };
  }, [applyBackgroundWeatherUpdate, applyDistrictRiskUpdate, applyFloodRiskUpdate, applyRadarUpdate, applyRainfallAlert, applyStormUpdate, applyWeatherAlert, applyWeatherOverlay, applyWeatherOverlayUpdate, on, pushRealtimeAlert]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    let lastSentAt = 0;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (Date.now() - lastSentAt < 7000) return;
        emit("location-update", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
        lastSentAt = Date.now();
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [emit]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadCity(searchQuery);
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedCity("Current Location");
        setMapCenter({ lat, lng, zoom: 10 });
        if (mapRef.current && mapAliveRef.current) mapRef.current.setView([lat, lng], 10);
        void fetchDistrictWeather("Current Location", { lat, lng, displayName: "Current Location" });
      },
      (error) => toast.error(`Location error: ${error.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <main className={cn("min-h-[calc(100vh-64px)] transition-colors duration-300", isLight ? "bg-slate-100 text-slate-950" : "bg-[#0f172a] text-slate-100")}>
      <div className={cn("min-h-[calc(100vh-64px)] bg-[radial-gradient(900px_460px_at_90%_-10%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(760px_520px_at_-10%_110%,rgba(96,165,250,0.14),transparent_58%)]", isLight && "bg-[radial-gradient(900px_460px_at_90%_-10%,rgba(14,165,233,0.16),transparent_60%),radial-gradient(760px_520px_at_-10%_110%,rgba(99,102,241,0.13),transparent_58%)]")}>
        <header className={cn("sticky top-0 z-[600] border-b backdrop-blur-md", isLight ? "border-slate-200 bg-slate-100/86" : "border-cyan-400/15 bg-[#0f172a]/88")}>
          <form onSubmit={handleSearch} className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-3 px-4 py-3 lg:grid-cols-[1fr_minmax(280px,520px)_auto_auto]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-400 font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
                DL
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-wide">DisasterLink Weather Command</p>
                <p className={cn("truncate text-[11px]", isLight ? "text-slate-500" : "text-slate-400")}>Leaflet + OpenStreetMap national disaster intelligence</p>
              </div>
            </div>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={cn("w-full rounded-xl border px-3 py-2 outline-none transition focus:ring-2", isLight ? "border-slate-200 bg-white text-slate-950 focus:ring-sky-300" : "border-slate-700 bg-[#0b1220] text-slate-100 focus:ring-cyan-400/40")}
              placeholder="Search city (e.g., Mumbai, Bengaluru, Delhi)..."
            />
            <button className={cn("inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5", isLight ? "border-slate-200 bg-white" : "border-slate-700 bg-[#0b1220]")}>
              <Search className="h-4 w-4" />
              Search
            </button>
            <button type="button" onClick={locateMe} className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-br from-cyan-400/35 to-blue-400/35 px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5">
              <LocateFixed className="h-4 w-4" />
              Use my location
            </button>
          </form>
        </header>

        <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-4 py-4 xl:grid-cols-[1.12fr_0.88fr]">
          <section className={cn("overflow-hidden rounded-[18px] border", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94 shadow-[0_12px_60px_rgba(0,0,0,0.28)]")}>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-black">Map & Layers</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-bold", isConnected ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300" : "border-red-400/40 bg-red-500/10 text-red-300")}>
                    <Wifi className="h-4 w-4" />
                    {isConnected ? "Socket Live" : "Socket Offline"}
                  </span>
                  <button onClick={refreshAll} className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-bold", isLight ? "border-slate-200 bg-slate-50" : "border-slate-700 bg-slate-950")}>
                    <RefreshCw className={cn("h-4 w-4", (radarLoading || loadingLive) && "animate-spin")} />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs font-bold uppercase opacity-70">Layer:</label>
                  <select value={activeWeatherLayer} onChange={(event) => setActiveWeatherLayer(event.target.value as WeatherTileLayer)} className={cn("rounded-xl border px-3 py-2 text-sm", isLight ? "border-slate-200 bg-white" : "border-slate-700 bg-[#0b1220]")}>
                    {WEATHER_LAYER_OPTIONS.map((option) => <option key={option.id || "none"} value={option.id}>{option.label}</option>)}
                  </select>
                  <label className="text-xs font-bold uppercase opacity-70">Opacity</label>
                  <input type="range" min="0" max="1" step="0.05" value={layerOpacity} onChange={(event) => setLayerOpacity(Number(event.target.value))} className="h-9 w-32 accent-cyan-400" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs font-bold uppercase opacity-70">Units</label>
                  <select value={units} onChange={(event) => setUnits(event.target.value as WeatherUnits)} className={cn("rounded-xl border px-3 py-2 text-sm", isLight ? "border-slate-200 bg-white" : "border-slate-700 bg-[#0b1220]")}>
                    <option value="metric">Metric (C, km/h)</option>
                    <option value="imperial">Imperial (F, mph)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {OPERATIONAL_TOGGLES.map((toggle) => (
                  <button
                    key={toggle.id}
                    onClick={() => toggleOperationalLayer(toggle.id)}
                    className={cn(
                      "inline-flex min-w-[96px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5",
                      operationalToggles[toggle.id]
                        ? "border-cyan-500 bg-cyan-100 text-slate-950 shadow-[0_0_0_2px_rgba(6,182,212,0.15),0_10px_24px_rgba(8,145,178,0.16)]"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-3.5 w-3.5 place-items-center rounded-[4px] border text-[9px] leading-none",
                        operationalToggles[toggle.id] ? "border-cyan-700 bg-cyan-600 text-white" : "border-slate-400 bg-white"
                      )}
                    >
                      {operationalToggles[toggle.id] ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                    </span>
                    <span className="whitespace-nowrap">{toggle.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-[520px] w-full border-y border-slate-800/70">
              <div ref={mapEl} className="h-full w-full" />
              {featuredAlert && (
                <div className={cn("absolute left-4 right-4 top-4 z-[550] rounded-xl border p-3 shadow-xl", severityClass(featuredAlert.severity), "bg-opacity-100")}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-black">{featuredAlert.title}</p>
                      <p className="truncate text-xs opacity-95">{featuredAlert.message}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 z-[550] rounded-xl border border-cyan-400/30 bg-slate-950/85 px-3 py-2 font-mono text-xs text-cyan-100 backdrop-blur">
                {lastUpdated ? `Radar ${new Date(lastUpdated).toLocaleTimeString()}` : "Radar syncing"}
              </div>
            </div>

            <div className={cn("px-4 py-3 text-xs", isLight ? "text-slate-500" : "text-slate-400")}>
              Weather radar by RainViewer. Operational map by OpenStreetMap and DisasterLink realtime intelligence.
            </div>
          </section>

          <section className="grid gap-3">
            <div className={cn("overflow-hidden rounded-[18px] border", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94")}>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 text-xl font-black text-cyan-200">
                  <WeatherGlyph condition={currentWeather?.condition} severity={currentWeather?.severity} className="text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black">{currentWeather?.city ?? selectedCity}</h2>
                  <p className={cn("truncate text-sm", isLight ? "text-slate-500" : "text-slate-400")}>{currentWeather?.condition ?? "Search a city or use your location."}</p>
                </div>
                <div className="text-right text-5xl font-black tracking-tight">{formatTemp(currentWeather?.temperature, units)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 pt-0 sm:grid-cols-3">
                {[
                  ["Feels like", formatTemp(currentWeather?.feelsLike, units)],
                  ["Humidity", currentWeather?.humidity != null ? `${currentWeather.humidity}%` : "--"],
                  ["Wind", formatWind(currentWeather?.windSpeed, units)],
                  ["Pressure", currentWeather?.pressure != null ? `${currentWeather.pressure} hPa` : "--"],
                  ["Visibility", currentWeather?.visibility != null ? `${currentWeather.visibility} km` : "--"],
                  ["Severity", currentWeather?.severity ?? "--"]
                ].map(([label, value]) => (
                  <div key={label} className={cn("rounded-[14px] border p-3", isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950/72")}>
                    <p className={cn("text-xs", isLight ? "text-slate-500" : "text-slate-400")}>{label}</p>
                    <p className="mt-1 text-lg font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn("rounded-[18px] border p-4", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94")}>
              <h3 className="mb-3 text-base font-black">Operational Risk</h3>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={cn("text-xs", isLight ? "text-slate-500" : "text-slate-400")}>Highest district risk</p>
                  <p className="text-xl font-black">{highestRisk?.district ?? "Monitoring"}</p>
                </div>
                <div className={cn("rounded-xl border px-3 py-2 text-sm font-black", severityClass(highestRisk?.level))}>{highestRisk?.level ?? "SAFE"}</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className={cn("rounded-xl border p-3", isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950")}>
                  <p className="text-xs opacity-70">SOS</p>
                  <p className="font-mono text-2xl font-black text-red-300">{activeIncidents.length}</p>
                </div>
                <div className={cn("rounded-xl border p-3", isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950")}>
                  <p className="text-xs opacity-70">Shelters</p>
                  <p className="font-mono text-2xl font-black text-emerald-300">{liveData.shelters.length}</p>
                </div>
                <div className={cn("rounded-xl border p-3", isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950")}>
                  <p className="text-xs opacity-70">Storms</p>
                  <p className="font-mono text-2xl font-black text-cyan-300">{stormTracking.length}</p>
                </div>
              </div>
            </div>

            <div className={cn("rounded-[18px] border p-4", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94")}>
              <h3 className="mb-3 text-base font-black">Realtime Alerts</h3>
              <div className="grid gap-2">
                {actionableAlerts.length === 0 ? (
                  <p className={cn("text-sm", isLight ? "text-slate-500" : "text-slate-400")}>No active severe-weather or incident alerts.</p>
                ) : actionableAlerts.map((alert, index) => (
                  <div key={`${alert.title}-${index}`} className={cn("rounded-xl border p-3", severityClass(alert.severity))}>
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">{alert.title}</p>
                        <p className="line-clamp-2 text-xs opacity-85">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>

        <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-4 pb-6 xl:grid-cols-4">
          <div className={cn("rounded-[18px] border p-4 xl:col-span-2", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94")}>
            <h3 className="mb-3 text-base font-black">Temperature Graph</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1f2937"} />
                  <XAxis dataKey="label" stroke={isLight ? "#475569" : "#94a3b8"} />
                  <YAxis stroke={isLight ? "#475569" : "#94a3b8"} />
                  <Tooltip />
                  <Area type="monotone" dataKey="temperature" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.22} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cn("rounded-[18px] border p-4", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94")}>
            <h3 className="mb-3 text-base font-black">Rainfall Graph</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1f2937"} />
                  <XAxis dataKey="label" stroke={isLight ? "#475569" : "#94a3b8"} />
                  <YAxis stroke={isLight ? "#475569" : "#94a3b8"} />
                  <Tooltip />
                  <Bar dataKey="rainfall" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cn("rounded-[18px] border p-4", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94")}>
            <h3 className="mb-3 text-base font-black">Wind & Humidity</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1f2937"} />
                  <XAxis dataKey="label" stroke={isLight ? "#475569" : "#94a3b8"} />
                  <YAxis stroke={isLight ? "#475569" : "#94a3b8"} />
                  <Tooltip />
                  <Line type="monotone" dataKey="wind" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cn("rounded-[18px] border p-4 xl:col-span-4", isLight ? "border-slate-200 bg-white shadow-sm" : "border-slate-800 bg-[#0b1220]/94")}>
            <h3 className="mb-3 text-base font-black">5-Day Forecast</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {cards.map((day) => (
                <div key={day.label} className={cn("rounded-[14px] border p-3 text-center", isLight ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-950/72")}>
                  <p className={cn("text-xs", isLight ? "text-slate-500" : "text-slate-400")}>{day.label}</p>
                  <div className="my-2 text-cyan-500">
                    <WeatherGlyph condition={currentWeather?.condition} severity={day.severity} />
                  </div>
                  <p className="font-black">{day.range}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{weatherLabel(currentWeather?.condition, day.severity)}</p>
                  <p className="mt-1 text-xs opacity-70">{day.rainfall}% rainfall risk</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {radarError && (
          <div className="fixed bottom-4 left-4 z-[700] rounded-xl border border-amber-300/50 bg-amber-950/90 px-3 py-2 text-xs text-amber-100 shadow-xl">
            {radarError}
          </div>
        )}

        <style jsx global>{`
          .leaflet-container {
            background: ${isLight ? "#dbeafe" : "#101827"};
            font-family: inherit;
          }
          .leaflet-control-zoom a {
            background: ${isLight ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.92)"} !important;
            color: ${isLight ? "#0f172a" : "#cffafe"} !important;
            border-color: rgba(34, 211, 238, 0.18) !important;
          }
          .leaflet-popup-content-wrapper,
          .leaflet-popup-tip {
            background: ${isLight ? "#ffffff" : "#0b1220"};
            color: ${isLight ? "#0f172a" : "#e5e7eb"};
            border: 1px solid rgba(34, 211, 238, 0.28);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
          }
          .dl-city-marker,
          .dl-sos-marker,
          .dl-volunteer-marker,
          .dl-shelter-marker,
          .dl-wind-marker {
            background: transparent;
            border: 0;
          }
          .dl-map-pin {
            position: relative;
            width: 42px;
            height: 52px;
            filter: drop-shadow(0 8px 10px rgba(15, 23, 42, 0.32));
          }
          .dl-map-pin-head {
            position: absolute;
            left: 4px;
            top: 0;
            display: grid;
            width: 34px;
            height: 34px;
            place-items: center;
            border-radius: 999px 999px 999px 0;
            border: 3px solid #ffffff;
            background: #38bdf8;
            color: #0f172a;
            font-size: 10px;
            font-weight: 950;
            transform: rotate(-45deg);
            box-shadow: 0 0 0 1px rgba(2, 132, 199, 0.28), 0 0 22px rgba(56, 189, 248, 0.45);
          }
          .dl-map-pin-head::before {
            content: "";
            position: absolute;
            inset: 6px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.28);
          }
          .dl-map-pin-head {
            text-shadow: 0 1px 0 rgba(255,255,255,0.35);
          }
          .dl-map-pin-head span {
            position: relative;
            z-index: 1;
            display: block;
            transform: rotate(45deg);
          }
          .dl-map-pin-head {
            line-height: 1;
          }
          .dl-map-pin-tip {
            position: absolute;
            left: 18px;
            top: 36px;
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.28);
          }
          .dl-pulse-red {
            position: absolute;
            inset: 0;
            border-radius: 999px;
            background: rgba(239, 68, 68, 0.32);
            animation: dlPulse 1.35s ease-out infinite;
          }
          .dl-sos-core {
            position: absolute;
            left: 8px;
            top: 8px;
            display: grid;
            width: 26px;
            height: 26px;
            place-items: center;
            border-radius: 999px;
            border: 2px solid rgba(255,255,255,0.9);
            background: #ef4444;
            color: #fff;
            font-size: 9px;
            font-weight: 900;
          }
          .dl-volunteer-core {
            width: 18px;
            height: 18px;
            border-radius: 999px;
            border: 2px solid rgba(255,255,255,0.85);
            background: #38bdf8;
            box-shadow: 0 0 18px rgba(56, 189, 248, 0.55);
          }
          .dl-shelter-core {
            position: relative;
            width: 24px;
            height: 24px;
            overflow: hidden;
            border-radius: 7px;
            border: 2px solid rgba(255,255,255,0.82);
            background: rgba(16,185,129,0.22);
            box-shadow: 0 0 18px rgba(16,185,129,0.3);
          }
          .dl-shelter-core span {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #10b981;
          }
          .dl-vector-marker {
            display: grid;
            width: 42px;
            height: 42px;
            place-items: center;
            border-radius: 999px;
            border: 1px solid rgba(96,165,250,0.8);
            background: rgba(15,23,42,0.88);
            color: #bfdbfe;
            font-size: 11px;
            font-weight: 900;
            line-height: 1;
            box-shadow: 0 0 18px rgba(96,165,250,0.28);
          }
          .dl-vector-marker span {
            color: #67e8f9;
            font-size: 10px;
          }
          @keyframes dlPulse {
            0% { transform: scale(0.6); opacity: 0.85; }
            100% { transform: scale(1.45); opacity: 0; }
          }
        `}</style>
      </div>
    </main>
  );
}
