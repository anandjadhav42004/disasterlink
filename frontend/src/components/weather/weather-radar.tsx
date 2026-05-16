"use client";

import { Radar } from "lucide-react";
import type { WeatherMapOverlay } from "@/store/weather-store";

export function WeatherRadar({ overlay }: { overlay: WeatherMapOverlay | null }) {
  const rainfallCount = overlay?.layers.rainfall.length ?? 0;
  const stormCount = overlay?.layers.storms.length ?? 0;
  const cycloneCount = overlay?.layers.cycloneZones.length ?? 0;

  return (
    <div className="relative min-h-64 overflow-hidden rounded-lg border border-outline-variant bg-[#101820] text-white">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/40" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/30" />
      <div className="absolute left-1/2 top-1/2 h-2 w-28 origin-left animate-pulse bg-cyan-300/60" />
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-cyan-300" />
          <h3 className="text-title-sm">Weather Radar</h3>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-white/10 p-2"><p className="text-label-caps text-cyan-100">Rain</p><p className="text-title-sm">{rainfallCount}</p></div>
          <div className="rounded-md bg-white/10 p-2"><p className="text-label-caps text-cyan-100">Storm</p><p className="text-title-sm">{stormCount}</p></div>
          <div className="rounded-md bg-white/10 p-2"><p className="text-label-caps text-cyan-100">Cyclone</p><p className="text-title-sm">{cycloneCount}</p></div>
        </div>
      </div>
    </div>
  );
}
