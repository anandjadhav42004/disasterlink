"use client";

import { cn } from "@/lib/utils";
import type { RadarRiskLevel } from "@/store/radar-store";

const tones: Record<RadarRiskLevel, string> = {
  SAFE: "border-emerald-400/40 bg-emerald-400/15 text-emerald-100",
  MODERATE: "border-amber-300/40 bg-amber-300/15 text-amber-100",
  SEVERE: "border-orange-400/50 bg-orange-500/20 text-orange-100",
  CRITICAL: "border-red-400/60 bg-red-500/25 text-red-100 shadow-[0_0_22px_rgba(248,113,113,0.22)]"
};

export function StormSeverityBadge({ severity, className }: { severity: RadarRiskLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded border px-2 py-1 text-[10px] font-bold uppercase", tones[severity], className)}>
      {severity}
    </span>
  );
}
