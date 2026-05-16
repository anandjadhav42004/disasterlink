"use client";

import { MapPin } from "lucide-react";
import { WeatherSeverityBadge } from "./weather-severity-badge";
import type { DisasterWeather } from "@/store/weather-store";

function rowKey(weather: DisasterWeather) {
  const district = weather.district || weather.city;
  return `${district.toLowerCase()}-${weather.coordinates.lat.toFixed(3)}-${weather.coordinates.lng.toFixed(3)}`;
}

export function DistrictWeatherPanel({ weatherByDistrict }: { weatherByDistrict: Record<string, DisasterWeather> }) {
  const rows = Array.from(
    new Map(Object.values(weatherByDistrict).map((weather) => [rowKey(weather), weather])).values()
  ).slice(0, 6);

  return (
    <div className="rounded-lg border border-outline-variant bg-[#11171d] p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-title-sm"><MapPin className="h-5 w-5 text-cyan-300" />District Weather</h3>
        <span className="text-label-caps text-white/60">LIVE</span>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && <p className="text-body-sm text-white/60">Awaiting district telemetry.</p>}
        {rows.map((weather) => (
          <div key={rowKey(weather)} className="flex items-center justify-between rounded-md bg-white/8 p-3">
            <div>
              <p className="font-bold">{weather.district}</p>
              <p className="text-xs text-white/60">{weather.condition} / {Math.round(weather.temperature)}C / {weather.rainfallProbability}% rain</p>
            </div>
            <WeatherSeverityBadge severity={weather.severity} className="border-white/20 text-white" />
          </div>
        ))}
      </div>
    </div>
  );
}
