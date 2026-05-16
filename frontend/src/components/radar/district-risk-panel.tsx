"use client";

import { ShieldAlert } from "lucide-react";
import type { OperationalRisk } from "@/store/radar-store";
import { StormSeverityBadge } from "./storm-severity-badge";

export function DistrictRiskPanel({ risks }: { risks: OperationalRisk[] }) {
  const sorted = [...risks].sort((a, b) => b.score - a.score).slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100">
          <ShieldAlert className="h-4 w-4 text-red-300" />
          District Severity
        </h3>
        <span className="font-mono text-xs text-slate-400">{sorted.length} LIVE</span>
      </div>
      <div className="space-y-2">
        {sorted.length === 0 && <p className="text-xs text-slate-500">Waiting for operational risk scores.</p>}
        {sorted.map((risk) => (
          <div key={risk.district} className="border border-slate-700/80 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-semibold text-slate-100">{risk.district}</span>
              <StormSeverityBadge severity={risk.level} />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-[10px] uppercase text-slate-500">
              <span>Risk <b className="block font-mono text-cyan-100">{risk.score}</b></span>
              <span>Rain <b className="block font-mono text-cyan-100">{Math.round(risk.rainIntensity)}</b></span>
              <span>SOS <b className="block font-mono text-cyan-100">{Math.round(risk.sosDensity)}</b></span>
              <span>Shelter <b className="block font-mono text-cyan-100">{Math.round(risk.shelterOccupancy)}</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
