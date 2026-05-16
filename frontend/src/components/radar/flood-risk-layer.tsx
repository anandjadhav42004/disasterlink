"use client";

import { Droplets } from "lucide-react";
import type { FloodRiskZone } from "@/store/radar-store";
import { StormSeverityBadge } from "./storm-severity-badge";

export function FloodRiskLayer({ zones }: { zones: FloodRiskZone[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <Droplets className="h-4 w-4 text-sky-300" />
          Flood Risk
        </h3>
        <span className="font-mono text-xs text-slate-400">{zones.length} ZONES</span>
      </div>
      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {zones.length === 0 && <p className="text-xs text-slate-500">No automated flood-risk zones are active.</p>}
        {zones.map((zone) => (
          <div key={zone.id} className="border border-slate-700/80 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-100">{zone.district}</p>
              <StormSeverityBadge severity={zone.severity} />
            </div>
            <div className="mt-2 h-1.5 bg-slate-800">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-amber-300 to-red-500" style={{ width: `${Math.max(4, zone.probability)}%` }} />
            </div>
            <p className="mt-2 font-mono text-xs text-cyan-100">{zone.probability}% flood probability</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{zone.triggers.join(" / ") || "Radar and operations fusion watch"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
