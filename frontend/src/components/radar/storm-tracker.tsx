"use client";

import { Activity, Navigation } from "lucide-react";
import type { StormTrack } from "@/store/radar-store";
import { StormSeverityBadge } from "./storm-severity-badge";

export function StormTracker({ storms }: { storms: StormTrack[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <Activity className="h-4 w-4 text-cyan-300" />
          Storm Tracking
        </h3>
        <span className="font-mono text-xs text-slate-400">{storms.length} CELLS</span>
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {storms.length === 0 && <p className="text-xs text-slate-500">No severe precipitation cells are moving through monitored districts.</p>}
        {storms.map((storm) => (
          <div key={storm.id} className="border border-slate-700/80 bg-slate-950/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{storm.name}</p>
                <p className="mt-1 text-xs text-slate-400">{storm.projectedImpact}</p>
              </div>
              <StormSeverityBadge severity={storm.severity} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <span className="text-slate-400">Intensity <b className="font-mono text-cyan-100">{storm.intensity}</b></span>
              <span className="text-slate-400">Speed <b className="font-mono text-cyan-100">{storm.speedKmph}</b></span>
              <span className="flex items-center gap-1 text-slate-400">
                <Navigation className="h-3 w-3" style={{ transform: `rotate(${storm.direction}deg)` }} />
                <b className="font-mono text-cyan-100">{storm.direction} deg</b>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
