import axios, { type AxiosInstance } from "axios";
import { Severity, SOSStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { logger } from "../../utils/logger.js";
import { analyzeWeatherRisk, buildWeatherAlert } from "./weather.alert-engine.js";
import { emitWeatherAlert, emitWeatherUpdate } from "./weather.socket.js";
import type {
  DisasterWeather,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  WeatherAlertPayload,
  WeatherForecastDay,
  WeatherMapOverlay,
  WeatherOverlayMarker,
  WeatherSeverity,
  WeatherstackResponse
} from "./weather.types.js";

const DEFAULT_WATCH_CITIES = ["Mumbai", "Delhi", "Ahmedabad", "Chennai", "Kolkata", "Guwahati", "Bhubaneswar", "Kochi"];
const FALLBACK_CITY_COORDINATES: Record<string, { lat: number; lng: number; district: string }> = {
  mumbai: { lat: 19.076, lng: 72.8777, district: "Maharashtra" },
  delhi: { lat: 28.6139, lng: 77.209, district: "Delhi" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, district: "Gujarat" },
  chennai: { lat: 13.0827, lng: 80.2707, district: "Tamil Nadu" },
  kolkata: { lat: 22.5726, lng: 88.3639, district: "West Bengal" },
  guwahati: { lat: 26.1445, lng: 91.7362, district: "Assam" },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, district: "Odisha" },
  kochi: { lat: 9.9312, lng: 76.2673, district: "Kerala" }
};
const cache = new Map<string, { expiresAt: number; value: unknown }>();

function getCache<T>(key: string) {
  const cached = cache.get(key);
  if (!cached || cached.expiresAt < Date.now()) return null;
  return cached.value as T;
}

function setCache(key: string, value: unknown, seconds = Number(process.env.WEATHER_REFRESH_INTERVAL ?? 300)) {
  cache.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
}

function numeric(value: unknown, fallback = 0) {
  const numberValue = typeof value === "string" ? Number(value) : value;
  return typeof numberValue === "number" && Number.isFinite(numberValue) ? numberValue : fallback;
}

function estimateRainfallProbability(current: WeatherstackResponse["current"]) {
  const precip = numeric(current?.precip);
  const cloudcover = numeric(current?.cloudcover);
  const condition = (current?.weather_descriptions?.[0] ?? "").toLowerCase();
  const conditionBoost = /(rain|drizzle|shower|thunder|storm|cyclone|monsoon)/i.test(condition) ? 35 : 0;
  return Math.min(100, Math.round(precip * 18 + cloudcover * 0.45 + conditionBoost));
}

function estimateOpenWeatherRainfallProbability(current: OpenWeatherCurrentResponse) {
  const rain = numeric(current.rain?.["1h"] ?? current.rain?.["3h"]);
  const cloudcover = numeric(current.clouds?.all);
  const condition = `${current.weather?.[0]?.main ?? ""} ${current.weather?.[0]?.description ?? ""}`.toLowerCase();
  const conditionBoost = /(rain|drizzle|shower|thunder|storm|cyclone|monsoon)/i.test(condition) ? 35 : 0;
  return Math.min(100, Math.round(rain * 18 + cloudcover * 0.45 + conditionBoost));
}

function normalizeWeatherstack(response: WeatherstackResponse, fallbackQuery: string): DisasterWeather {
  if (response.error) {
    throw new Error(response.error.info || response.error.type || "Weatherstack request failed");
  }

  const location = response.location ?? {};
  const current = response.current ?? {};
  const base = {
    city: location.name || fallbackQuery,
    district: location.region || location.name || fallbackQuery,
    country: location.country || "India",
    coordinates: {
      lat: numeric(location.lat),
      lng: numeric(location.lon)
    },
    temperature: numeric(current.temperature),
    feelsLike: numeric(current.feelslike ?? current.temperature),
    humidity: numeric(current.humidity),
    windSpeed: numeric(current.wind_speed),
    visibility: numeric(current.visibility, 10),
    pressure: numeric(current.pressure),
    uvIndex: numeric(current.uv_index),
    condition: current.weather_descriptions?.[0] || "Unknown",
    icon: current.weather_icons?.[0],
    rainfallProbability: estimateRainfallProbability(current),
    updatedAt: location.localtime ? new Date(location.localtime).toISOString() : new Date().toISOString(),
    provider: "weatherstack" as const
  };
  const analysis = analyzeWeatherRisk(base);
  return { ...base, ...analysis };
}

function normalizeOpenWeather(response: OpenWeatherCurrentResponse, fallbackQuery: string): DisasterWeather {
  const city = response.name || fallbackQuery.split(",")[0]?.trim() || fallbackQuery || "Unknown";
  const profile = FALLBACK_CITY_COORDINATES[city.toLowerCase()];
  const condition = response.weather?.[0]?.description || response.weather?.[0]?.main || "Unknown";
  const base = {
    city,
    district: profile?.district ?? city,
    country: response.sys?.country === "IN" ? "India" : response.sys?.country || "India",
    coordinates: {
      lat: numeric(response.coord?.lat, profile?.lat ?? 0),
      lng: numeric(response.coord?.lon, profile?.lng ?? 0)
    },
    temperature: numeric(response.main?.temp),
    feelsLike: numeric(response.main?.feels_like ?? response.main?.temp),
    humidity: numeric(response.main?.humidity),
    windSpeed: Math.round(numeric(response.wind?.speed) * 3.6),
    visibility: Math.round(numeric(response.visibility, 10_000) / 1000),
    pressure: numeric(response.main?.pressure),
    uvIndex: 0,
    condition,
    icon: response.weather?.[0]?.icon,
    rainfallProbability: estimateOpenWeatherRainfallProbability(response),
    updatedAt: response.dt ? new Date(response.dt * 1000).toISOString() : new Date().toISOString(),
    provider: "openweather" as const
  };
  const analysis = analyzeWeatherRisk(base);
  return { ...base, ...analysis };
}

function normalizeForecast(response: WeatherstackResponse): WeatherForecastDay[] {
  return Object.entries(response.forecast ?? {}).map(([date, day]) => {
    const rainfallProbability = Math.max(...(day.hourly ?? []).map((hour) => numeric(hour.chanceofrain ?? hour.precip)), 0);
    const condition = day.hourly?.find((hour) => hour.weather_descriptions?.[0])?.weather_descriptions?.[0] ?? "Forecast";
    const analysis = analyzeWeatherRisk({
      city: response.location?.name ?? "",
      district: response.location?.region ?? response.location?.name ?? "",
      country: response.location?.country ?? "India",
      coordinates: { lat: numeric(response.location?.lat), lng: numeric(response.location?.lon) },
      temperature: numeric(day.avgtemp),
      feelsLike: numeric(day.avgtemp),
      humidity: 0,
      windSpeed: 0,
      visibility: 10,
      pressure: 0,
      uvIndex: numeric(day.uv_index),
      condition,
      icon: undefined,
      rainfallProbability,
      updatedAt: new Date().toISOString(),
      provider: "weatherstack"
    });

    return {
      date,
      minTemperature: day.mintemp,
      maxTemperature: day.maxtemp,
      averageTemperature: day.avgtemp,
      rainfallProbability,
      condition,
      severity: analysis.severity
    };
  });
}

function normalizeOpenWeatherForecast(response: OpenWeatherForecastResponse): WeatherForecastDay[] {
  const days = new Map<
    string,
    {
      min: number;
      max: number;
      total: number;
      count: number;
      rainfallProbability: number;
      condition: string;
    }
  >();

  for (const item of response.list ?? []) {
    if (!item.dt) continue;
    const date = new Date(item.dt * 1000).toISOString().slice(0, 10);
    const temperature = numeric(item.main?.temp);
    const min = numeric(item.main?.temp_min, temperature);
    const max = numeric(item.main?.temp_max, temperature);
    const rainfallProbability = Math.round(numeric(item.pop) * 100);
    const condition = item.weather?.[0]?.description || item.weather?.[0]?.main || "Forecast";
    const existing = days.get(date);

    if (!existing) {
      days.set(date, {
        min,
        max,
        total: temperature,
        count: 1,
        rainfallProbability,
        condition
      });
      continue;
    }

    existing.min = Math.min(existing.min, min);
    existing.max = Math.max(existing.max, max);
    existing.total += temperature;
    existing.count += 1;
    if (rainfallProbability > existing.rainfallProbability) {
      existing.rainfallProbability = rainfallProbability;
      existing.condition = condition;
    }
  }

  return Array.from(days.entries())
    .slice(0, 5)
    .map(([date, day]) => {
      const averageTemperature = Math.round(day.total / Math.max(day.count, 1));
      const analysis = analyzeWeatherRisk({
        city: response.city?.name ?? "",
        district: response.city?.name ?? "",
        country: response.city?.country === "IN" ? "India" : response.city?.country ?? "India",
        coordinates: {
          lat: numeric(response.city?.coord?.lat),
          lng: numeric(response.city?.coord?.lon)
        },
        temperature: averageTemperature,
        feelsLike: averageTemperature,
        humidity: 0,
        windSpeed: 0,
        visibility: 10,
        pressure: 0,
        uvIndex: 0,
        condition: day.condition,
        rainfallProbability: day.rainfallProbability,
        updatedAt: new Date().toISOString(),
        provider: "openweather"
      });

      return {
        date,
        minTemperature: Math.round(day.min),
        maxTemperature: Math.round(day.max),
        averageTemperature,
        rainfallProbability: day.rainfallProbability,
        condition: day.condition,
        severity: analysis.severity
      };
    });
}

function fallbackWeather(query: string, reason: string): DisasterWeather {
  const city = query.split(",")[0]?.trim() || query || "India";
  const profile = FALLBACK_CITY_COORDINATES[city.toLowerCase()] ?? { lat: 22.9734, lng: 78.6569, district: city };
  const base = {
    city,
    district: profile.district,
    country: "India",
    coordinates: { lat: profile.lat, lng: profile.lng },
    temperature: 29,
    feelsLike: 32,
    humidity: 72,
    windSpeed: 14,
    visibility: 8,
    pressure: 1008,
    uvIndex: 4,
    condition: "Weatherstack temporarily unavailable",
    rainfallProbability: 35,
    updatedAt: new Date().toISOString(),
    provider: "fallback" as const
  };
  const analysis = analyzeWeatherRisk(base);
  return {
    ...base,
    ...analysis,
    risks: ["weather-provider-unavailable", ...analysis.risks],
    recommendedActions: [
      `Live weather fetch failed: ${reason}`,
      "Using operational fallback weather until provider quota or connectivity recovers.",
      ...analysis.recommendedActions
    ]
  };
}

function fallbackForecast(city: string): { city: string; forecast: WeatherForecastDay[]; provider: string; updatedAt: string; fallback: boolean } {
  const today = new Date();
  return {
    city,
    provider: "weatherstack",
    updatedAt: new Date().toISOString(),
    fallback: true,
    forecast: Array.from({ length: 5 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        date: date.toISOString().slice(0, 10),
        minTemperature: 25,
        maxTemperature: 32,
        averageTemperature: 29,
        rainfallProbability: index === 0 ? 35 : 30,
        condition: "Provider fallback",
        severity: "MODERATE" as WeatherSeverity
      };
    })
  };
}

function snapshotToWeather(snapshot: {
  city: string;
  district: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  condition: string;
  icon: string | null;
  severity: string;
  rainfallProbability: number | null;
  provider: string;
  observedAt: Date;
}): DisasterWeather {
  return {
    city: snapshot.city,
    district: snapshot.district,
    country: snapshot.country,
    coordinates: { lat: snapshot.latitude, lng: snapshot.longitude },
    temperature: snapshot.temperature,
    feelsLike: snapshot.feelsLike,
    humidity: snapshot.humidity,
    windSpeed: snapshot.windSpeed,
    visibility: snapshot.visibility,
    pressure: snapshot.pressure,
    uvIndex: snapshot.uvIndex,
    condition: snapshot.condition,
    icon: snapshot.icon ?? undefined,
    severity: snapshot.severity as WeatherSeverity,
    rainfallProbability: snapshot.rainfallProbability ?? 0,
    updatedAt: snapshot.observedAt.toISOString(),
    provider: snapshot.provider as DisasterWeather["provider"],
    risks: ["cached-provider-snapshot"],
    recommendedActions: ["Using the latest stored Weatherstack snapshot until the provider rate limit clears."]
  };
}

function toPrismaAlertSeverity(severity: WeatherSeverity) {
  return severity === "CRITICAL" ? Severity.CRITICAL : severity === "SEVERE" ? Severity.HIGH : Severity.MEDIUM;
}

function overlayMarker(snapshot: {
  id: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  severity: string;
  rainfallProbability: number | null;
  temperature: number;
  windSpeed: number;
  condition: string;
}, type: string, value: number, label: string): WeatherOverlayMarker {
  return {
    id: `${type}-${snapshot.id}`,
    city: snapshot.city,
    district: snapshot.district,
    coordinates: { lat: snapshot.latitude, lng: snapshot.longitude },
    severity: snapshot.severity as WeatherSeverity,
    value,
    label,
    type
  };
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

class WeatherService {
  private client: AxiosInstance;
  private openWeatherClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.WEATHERSTACK_BASE_URL ?? "http://api.weatherstack.com",
      timeout: Number(process.env.WEATHERSTACK_TIMEOUT_MS ?? 6000)
    });
    this.openWeatherClient = axios.create({
      baseURL: process.env.OPENWEATHER_BASE_URL ?? "https://api.openweathermap.org",
      timeout: Number(process.env.OPENWEATHER_TIMEOUT_MS ?? 6000)
    });
  }

  private async request(endpoint: "current" | "forecast" | "historical", params: Record<string, string | number>) {
    const accessKey = process.env.WEATHERSTACK_API_KEY;
    if (!accessKey) {
      throw new Error("WEATHERSTACK_API_KEY is not configured");
    }
    const response = await this.client.get<WeatherstackResponse>(`/${endpoint}`, {
      params: { access_key: accessKey, units: "m", ...params }
    });
    return response.data;
  }

  private openWeatherParams(query: string) {
    const coordinateMatch = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (coordinateMatch) {
      return {
        lat: coordinateMatch[1],
        lon: coordinateMatch[2]
      };
    }

    return { q: query };
  }

  private async requestOpenWeatherCurrent(query: string) {
    const appid = process.env.OPENWEATHER_API_KEY;
    if (!appid) {
      throw new Error("OPENWEATHER_API_KEY is not configured");
    }

    const response = await this.openWeatherClient.get<OpenWeatherCurrentResponse>("/data/2.5/weather", {
      params: { ...this.openWeatherParams(query), appid, units: "metric" }
    });

    return response.data;
  }

  private async requestOpenWeatherForecast(query: string) {
    const appid = process.env.OPENWEATHER_API_KEY;
    if (!appid) {
      throw new Error("OPENWEATHER_API_KEY is not configured");
    }

    const response = await this.openWeatherClient.get<OpenWeatherForecastResponse>("/data/2.5/forecast", {
      params: { ...this.openWeatherParams(query), appid, units: "metric" }
    });

    return response.data;
  }

  async getCurrentWeather(city: string) {
    const cacheKey = `current:${city.toLowerCase()}`;
    const cached = getCache<DisasterWeather>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request("current", { query: city });
      const weather = normalizeWeatherstack(data, city);
      await this.persistWeatherSnapshot(weather, data);
      setCache(cacheKey, weather);
      return weather;
    } catch (weatherstackError) {
      try {
        const data = await this.requestOpenWeatherCurrent(city);
        const weather = normalizeOpenWeather(data, city);
        await this.persistWeatherSnapshot(weather, data);
        logger.warn("Weatherstack current request failed; serving OpenWeather live weather", {
          city,
          error: weatherstackError instanceof Error ? weatherstackError.message : String(weatherstackError)
        });
        setCache(cacheKey, weather);
        return weather;
      } catch (openWeatherError) {
      const fallback = await this.getLatestStoredWeather(city);
      if (fallback) {
        logger.warn("Live weather requests failed; serving latest stored weather snapshot", {
          city,
          weatherstackError: weatherstackError instanceof Error ? weatherstackError.message : String(weatherstackError),
          openWeatherError: openWeatherError instanceof Error ? openWeatherError.message : String(openWeatherError)
        });
        setCache(cacheKey, fallback, 120);
        return fallback;
      }
      const message = openWeatherError instanceof Error ? openWeatherError.message : String(openWeatherError);
      const generatedFallback = fallbackWeather(city, message);
      logger.warn("Live weather requests failed; serving generated operational fallback", {
        city,
        weatherstackError: weatherstackError instanceof Error ? weatherstackError.message : String(weatherstackError),
        openWeatherError: message
      });
      setCache(cacheKey, generatedFallback, 120);
      return generatedFallback;
      }
    }
  }

  async getForecast(city: string) {
    const cacheKey = `forecast:${city.toLowerCase()}`;
    const cached = getCache<{ city: string; forecast: WeatherForecastDay[]; provider: string; updatedAt: string }>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.request("forecast", { query: city, forecast_days: 5, hourly: 1 });
      const payload = {
        city: data.location?.name ?? city,
        forecast: normalizeForecast(data),
        provider: "weatherstack",
        updatedAt: new Date().toISOString()
      };
      setCache(cacheKey, payload, 1800);
      return payload;
    } catch (weatherstackError) {
      try {
        const data = await this.requestOpenWeatherForecast(city);
        const payload = {
          city: data.city?.name ?? city,
          forecast: normalizeOpenWeatherForecast(data),
          provider: "openweather",
          updatedAt: new Date().toISOString()
        };
        logger.warn("Weatherstack forecast request failed; serving OpenWeather live forecast", {
          city,
          error: weatherstackError instanceof Error ? weatherstackError.message : String(weatherstackError)
        });
        setCache(cacheKey, payload, 1800);
        return payload;
      } catch (openWeatherError) {
      const message = openWeatherError instanceof Error ? openWeatherError.message : String(openWeatherError);
      const payload = fallbackForecast(city);
      logger.warn("Live forecast requests failed; serving generated operational forecast fallback", {
        city,
        weatherstackError: weatherstackError instanceof Error ? weatherstackError.message : String(weatherstackError),
        openWeatherError: message
      });
      setCache(cacheKey, payload, 600);
      return payload;
      }
    }
  }

  async getHistoricalWeather(city: string) {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return this.request("historical", { query: city, historical_date: date, hourly: 1 });
  }

  async getWeatherAlerts(city: string) {
    const weather = await this.getCurrentWeather(city);
    const alert = buildWeatherAlert(weather);
    const storedAlerts = await prisma.weatherAlert.findMany({
      where: {
        city: { equals: weather.city, mode: "insensitive" },
        status: "active"
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return {
      city: weather.city,
      district: weather.district,
      severity: weather.severity,
      active: storedAlerts,
      generated: alert ? [alert] : []
    };
  }

  async getDistrictWeather(lat: number, lng: number) {
    return this.getCurrentWeather(`${lat},${lng}`);
  }

  async getDistrictWeatherByName(district: string) {
    return this.getCurrentWeather(`${district}, India`);
  }

  async getMapOverlay(): Promise<WeatherMapOverlay> {
    let snapshots = await prisma.weatherSnapshot.findMany({
      orderBy: { observedAt: "desc" },
      distinct: ["city"],
      take: 100
    });

    if (snapshots.length === 0 && process.env.WEATHERSTACK_API_KEY) {
      await Promise.allSettled(DEFAULT_WATCH_CITIES.map((city) => this.getCurrentWeather(city)));
      snapshots = await prisma.weatherSnapshot.findMany({
        orderBy: { observedAt: "desc" },
        distinct: ["city"],
        take: 100
      });
    }

    const layers: WeatherMapOverlay["layers"] = {
      rainfall: [],
      storms: [],
      heatZones: [],
      floodRisk: [],
      cycloneZones: [],
      severityMarkers: []
    };

    for (const snapshot of snapshots) {
      if ((snapshot.rainfallProbability ?? 0) >= 40) {
        layers.rainfall.push(overlayMarker(snapshot, "rainfall", snapshot.rainfallProbability ?? 0, `${snapshot.rainfallProbability ?? 0}% rain risk`));
      }
      if (/(storm|thunder|squall)/i.test(snapshot.condition)) {
        layers.storms.push(overlayMarker(snapshot, "storm", snapshot.windSpeed, snapshot.condition));
      }
      if (snapshot.temperature >= 40) {
        layers.heatZones.push(overlayMarker(snapshot, "heat", snapshot.temperature, `${snapshot.temperature}C`));
      }
      if ((snapshot.rainfallProbability ?? 0) >= 65 || /flood/i.test(snapshot.condition)) {
        layers.floodRisk.push(overlayMarker(snapshot, "flood", snapshot.rainfallProbability ?? 0, "Flood-risk watch"));
      }
      if (/(cyclone|hurricane|typhoon)/i.test(snapshot.condition)) {
        layers.cycloneZones.push(overlayMarker(snapshot, "cyclone", snapshot.windSpeed, "Cyclone-risk zone"));
      }
      if (snapshot.severity !== "SAFE") {
        layers.severityMarkers.push(overlayMarker(snapshot, "severity", snapshot.temperature, snapshot.severity));
      }
    }

    return { generatedAt: new Date().toISOString(), layers };
  }

  async refreshCities(cities = DEFAULT_WATCH_CITIES) {
    const weather: DisasterWeather[] = [];
    for (const city of cities) {
      try {
        weather.push(await this.getCurrentWeather(city));
      } catch (error) {
        logger.warn("Weather refresh failed for city", { city, error: error instanceof Error ? error.message : String(error) });
      }
    }
    return weather;
  }

  private async getLatestStoredWeather(city: string) {
    const query = city.split(",")[0]?.trim() || city;
    const snapshot = await prisma.weatherSnapshot.findFirst({
      where: {
        OR: [
          { city: { equals: query, mode: "insensitive" } },
          { district: { equals: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { district: { contains: query, mode: "insensitive" } }
        ]
      },
      orderBy: { observedAt: "desc" }
    });

    return snapshot ? snapshotToWeather(snapshot) : null;
  }

  async pollSevereAlerts(cities = DEFAULT_WATCH_CITIES) {
    const weatherList = await this.refreshCities(cities);
    const alerts: WeatherAlertPayload[] = [];
    for (const weather of weatherList) {
      const alert = buildWeatherAlert(weather);
      if (alert) {
        const stored = await this.persistOperationalAlert(alert);
        if (stored) {
          emitWeatherAlert(alert);
          alerts.push(alert);
        }
      }
      emitWeatherUpdate(weather);
    }
    return alerts;
  }

  private async persistWeatherSnapshot(weather: DisasterWeather, raw: unknown) {
    const snapshot = await prisma.weatherSnapshot.create({
      data: {
        city: weather.city,
        district: weather.district,
        country: weather.country,
        latitude: weather.coordinates.lat,
        longitude: weather.coordinates.lng,
        temperature: weather.temperature,
        feelsLike: weather.feelsLike,
        humidity: Math.round(weather.humidity),
        windSpeed: weather.windSpeed,
        visibility: weather.visibility,
        pressure: weather.pressure,
        uvIndex: weather.uvIndex,
        condition: weather.condition,
        icon: weather.icon,
        severity: weather.severity,
        rainfallProbability: weather.rainfallProbability,
        provider: weather.provider,
        raw: toJson(raw),
        observedAt: new Date(weather.updatedAt)
      }
    });

    await prisma.weatherEvent.create({
      data: {
        eventType: "WEATHER_SNAPSHOT",
        city: weather.city,
        district: weather.district,
        severity: weather.severity,
        payload: toJson(weather)
      }
    });

    const alert = buildWeatherAlert(weather);
    if (alert && process.env.WEATHER_ALERT_ENABLED !== "false") {
      const stored = await this.persistOperationalAlert(alert, snapshot.id);
      if (stored) emitWeatherAlert(alert);
    }

    return snapshot;
  }

  private async persistOperationalAlert(alert: WeatherAlertPayload, snapshotId?: string) {
    const existing = await prisma.weatherAlert.findFirst({
      where: {
        city: { equals: alert.city, mode: "insensitive" },
        type: alert.type,
        severity: alert.severity,
        status: "active",
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) }
      }
    });
    if (existing) return null;

    const weatherAlert = await prisma.weatherAlert.create({
      data: {
        city: alert.city,
        district: alert.district,
        country: alert.country,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        type: alert.type,
        latitude: alert.coordinates.lat,
        longitude: alert.coordinates.lng,
        source: alert.weather.provider,
        snapshotId,
        metadata: toJson({
          risks: alert.risks,
          recommendedActions: alert.recommendedActions,
          weather: alert.weather
        })
      }
    });

    await prisma.alert.create({
      data: {
        title: alert.title,
        message: alert.message,
        severity: toPrismaAlertSeverity(alert.severity),
        latitude: alert.coordinates.lat,
        longitude: alert.coordinates.lng,
        district: alert.district,
        state: alert.district,
        channels: ["app", "socket", "volunteer", "admin"],
        metadata: { source: "weather", weatherAlertId: weatherAlert.id, risks: alert.risks }
      }
    });

    if (alert.severity === "CRITICAL") {
      await prisma.sOSRequest.updateMany({
        where: {
          status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] },
          user: { district: { equals: alert.district, mode: "insensitive" } }
        },
        data: { severity: Severity.CRITICAL }
      });
    }

    await prisma.weatherEvent.create({
      data: {
        eventType: "WEATHER_ALERT",
        city: alert.city,
        district: alert.district,
        severity: alert.severity,
        payload: toJson(alert)
      }
    });

    return weatherAlert;
  }
}

export const weatherService = new WeatherService();
