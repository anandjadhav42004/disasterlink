"use client";

import { useEffect, useMemo, useState } from "react";
import type { DisasterWeather } from "@/store/weather-store";

const ROTATION_INTERVAL_MS = 10_000;

function weatherIdentity(weather: DisasterWeather) {
  const district = weather.district || weather.city;
  return `${district.toLowerCase()}-${weather.coordinates.lat.toFixed(3)}-${weather.coordinates.lng.toFixed(3)}`;
}

export function useRotatingWeather(
  weatherByDistrict: Record<string, DisasterWeather>,
  fallback: DisasterWeather | null,
  intervalMs = ROTATION_INTERVAL_MS
) {
  const weatherList = useMemo(() => {
    return Array.from(
      new Map(Object.values(weatherByDistrict).map((weather) => [weatherIdentity(weather), weather])).values()
    ).sort((a, b) => (a.district || a.city).localeCompare(b.district || b.city));
  }, [weatherByDistrict]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (weatherList.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % weatherList.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, weatherList.length]);

  return weatherList.length > 0 ? weatherList[activeIndex % weatherList.length] : fallback;
}
