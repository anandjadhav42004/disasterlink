export type WeatherSeverity = "SAFE" | "MODERATE" | "SEVERE" | "CRITICAL";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DisasterWeather {
  city: string;
  district: string;
  country: string;
  coordinates: Coordinates;
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
  provider: "weatherstack" | "openweather" | "fallback";
  risks: string[];
  recommendedActions: string[];
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

export interface WeatherAlertPayload {
  title: string;
  message: string;
  city: string;
  district: string;
  country: string;
  severity: WeatherSeverity;
  type: "RAINFALL" | "HEATWAVE" | "CYCLONE" | "STORM" | "VISIBILITY" | "WIND" | "GENERAL";
  coordinates: Coordinates;
  risks: string[];
  recommendedActions: string[];
  weather: DisasterWeather;
  createdAt: string;
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

export interface WeatherOverlayMarker {
  id: string;
  city: string;
  district: string;
  coordinates: Coordinates;
  severity: WeatherSeverity;
  value: number;
  label: string;
  type: string;
}

export interface WeatherstackResponse {
  success?: boolean;
  error?: {
    code: number;
    type: string;
    info: string;
  };
  request?: {
    type?: string;
    query?: string;
    language?: string;
    unit?: string;
  };
  location?: {
    name?: string;
    country?: string;
    region?: string;
    lat?: string;
    lon?: string;
    localtime?: string;
  };
  current?: {
    observation_time?: string;
    temperature?: number;
    weather_code?: number;
    weather_icons?: string[];
    weather_descriptions?: string[];
    wind_speed?: number;
    wind_degree?: number;
    wind_dir?: string;
    pressure?: number;
    precip?: number;
    humidity?: number;
    cloudcover?: number;
    feelslike?: number;
    uv_index?: number;
    visibility?: number;
  };
  forecast?: Record<
    string,
    {
      mintemp?: number;
      maxtemp?: number;
      avgtemp?: number;
      totalsnow?: number;
      sunhour?: number;
      uv_index?: number;
      hourly?: Array<{
        chanceofrain?: number;
        precip?: number;
        weather_descriptions?: string[];
        temperature?: number;
      }>;
    }
  >;
  historical?: Record<string, unknown>;
}

export interface OpenWeatherCurrentResponse {
  name?: string;
  coord?: {
    lat?: number;
    lon?: number;
  };
  sys?: {
    country?: string;
  };
  weather?: Array<{
    description?: string;
    main?: string;
    icon?: string;
  }>;
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  visibility?: number;
  wind?: {
    speed?: number;
  };
  clouds?: {
    all?: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  dt?: number;
}

export interface OpenWeatherForecastResponse {
  city?: {
    name?: string;
    country?: string;
    coord?: {
      lat?: number;
      lon?: number;
    };
  };
  list?: Array<{
    dt?: number;
    main?: {
      temp?: number;
      temp_min?: number;
      temp_max?: number;
      humidity?: number;
      pressure?: number;
    };
    weather?: Array<{
      description?: string;
      main?: string;
      icon?: string;
    }>;
    wind?: {
      speed?: number;
    };
    visibility?: number;
    pop?: number;
    rain?: {
      "3h"?: number;
    };
  }>;
}
