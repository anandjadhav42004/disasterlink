"use client";

import { CloudSun, Droplets, Eye, Gauge, Thermometer, Wind } from "lucide-react";
import { WeatherSeverityBadge } from "./weather-severity-badge";
import type { DisasterWeather } from "@/store/weather-store";

function metric(label: string, value: string, icon: React.ReactNode) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
      <div className="mb-1 flex items-center gap-2 text-on-surface-variant">
        {icon}
        <span className="text-label-caps">{label}</span>
      </div>
      <p className="text-title-sm">{value}</p>
    </div>
  );
}

export function WeatherCard({ weather, compact = false }: { weather: DisasterWeather | null; compact?: boolean }) {
  if (!weather) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <p className="text-label-caps text-on-surface-variant">Weather Intelligence</p>
        <p className="mt-2 text-body-sm text-on-surface-variant">Waiting for backend Weatherstack data.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-caps text-on-surface-variant">{weather.district}, {weather.country}</p>
          <h3 className="mt-1 flex items-center gap-2 text-title-sm">
            <CloudSun className="h-5 w-5 text-primary" />
            {weather.condition}
          </h3>
        </div>
        <WeatherSeverityBadge severity={weather.severity} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[42px] font-bold leading-none">{Math.round(weather.temperature)}C</p>
          <p className="text-body-sm text-on-surface-variant">Feels like {Math.round(weather.feelsLike)}C</p>
        </div>
        {weather.icon && <img src={weather.icon} alt="" className="h-12 w-12 rounded-md" />}
      </div>

      {!compact && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {metric("Humidity", `${weather.humidity}%`, <Droplets className="h-4 w-4" />)}
          {metric("Wind", `${weather.windSpeed} km/h`, <Wind className="h-4 w-4" />)}
          {metric("Rain Risk", `${weather.rainfallProbability}%`, <Gauge className="h-4 w-4" />)}
          {metric("Visibility", `${weather.visibility} km`, <Eye className="h-4 w-4" />)}
          {metric("Pressure", `${weather.pressure} mb`, <Thermometer className="h-4 w-4" />)}
          {metric("UV Index", String(weather.uvIndex), <CloudSun className="h-4 w-4" />)}
        </div>
      )}
    </div>
  );
}
