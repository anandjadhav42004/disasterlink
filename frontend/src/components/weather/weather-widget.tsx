"use client";

import { CloudRain, Wind } from "lucide-react";
import { WeatherSeverityBadge } from "./weather-severity-badge";
import type { DisasterWeather } from "@/store/weather-store";

export function WeatherWidget({ weather }: { weather: DisasterWeather | null }) {
  if (!weather) return null;

  return (
    <div className="rounded-lg border border-outline-variant bg-[#141a20] p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase text-white/60">Field Weather</p>
          <p className="mt-1 text-lg font-bold">{weather.district}</p>
        </div>
        <WeatherSeverityBadge severity={weather.severity} className="border-white/20 text-white" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div><p className="text-2xl font-bold">{Math.round(weather.temperature)}C</p><p className="text-xs text-white/60">{weather.condition}</p></div>
        <div className="flex flex-col items-center justify-center rounded-md bg-white/10 p-2"><CloudRain className="h-4 w-4" /><span className="text-sm">{weather.rainfallProbability}%</span></div>
        <div className="flex flex-col items-center justify-center rounded-md bg-white/10 p-2"><Wind className="h-4 w-4" /><span className="text-sm">{weather.windSpeed}</span></div>
      </div>
    </div>
  );
}
