"use client";

import { AlertTriangle, RadioTower } from "lucide-react";
import { WeatherSeverityBadge } from "./weather-severity-badge";
import type { DisasterWeather, WeatherAlert } from "@/store/weather-store";

export function OperationalWeatherBar({ weather, alerts }: { weather: DisasterWeather | null; alerts: WeatherAlert[] }) {
  if (!weather && alerts.length === 0) return null;
  const topAlert = alerts[0];

  return (
    <div className="mb-6 rounded-lg border border-outline-variant bg-[#12181f] p-4 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <RadioTower className="mt-1 h-5 w-5 text-cyan-300" />
          <div>
            <p className="text-[11px] font-bold uppercase text-white/60">Operational Weather Intelligence</p>
            <p className="text-body-base font-bold">
              {topAlert?.title ?? `${weather?.district ?? "India"} weather status: ${weather?.condition ?? "monitoring"}`}
            </p>
            <p className="text-body-sm text-white/60">
              {topAlert?.message ?? `${weather?.rainfallProbability ?? 0}% rain risk, ${weather?.windSpeed ?? 0} km/h wind, visibility ${weather?.visibility ?? 0} km.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {topAlert && <AlertTriangle className="h-5 w-5 text-red-300" />}
          {weather && <WeatherSeverityBadge severity={weather.severity} className="border-white/20 text-white" />}
        </div>
      </div>
    </div>
  );
}
