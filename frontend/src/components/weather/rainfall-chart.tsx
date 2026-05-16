"use client";

import type { DisasterWeather, WeatherForecastDay } from "@/store/weather-store";

export function RainfallChart({ forecast, currentWeather }: { forecast: WeatherForecastDay[]; currentWeather?: DisasterWeather | null }) {
  const data = forecast.length > 0
    ? forecast
    : currentWeather
      ? [{
          date: "Now",
          rainfallProbability: currentWeather.rainfallProbability,
          condition: currentWeather.condition,
          severity: currentWeather.severity
        }]
      : [];

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-title-sm">Rainfall Outlook</h3>
        <span className="text-label-caps text-on-surface-variant">{forecast.length > 0 ? "5 DAY" : "CURRENT"}</span>
      </div>
      {data.length === 0 ? (
        <div className="grid h-32 place-items-center rounded-md border border-dashed border-outline-variant text-center">
          <p className="px-4 text-body-sm text-on-surface-variant">Live rainfall data is not available yet.</p>
        </div>
      ) : (
      <div className="flex h-32 items-end gap-2">
        {data.slice(0, 5).map((day) => {
          const value = Math.min(100, Math.max(4, day.rainfallProbability ?? 0));
          return (
            <div key={day.date} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className="rounded-t-md bg-primary/70" style={{ height: `${value}%` }} title={`${value}% rainfall probability`} />
              <span className="truncate text-center text-[10px] text-on-surface-variant">{day.date.slice(5) || day.date}</span>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
