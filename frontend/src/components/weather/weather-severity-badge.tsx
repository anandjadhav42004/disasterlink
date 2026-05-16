import { cn } from "@/lib/utils";
import type { WeatherSeverity } from "@/store/weather-store";

const severityStyles: Record<WeatherSeverity, string> = {
  SAFE: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  MODERATE: "bg-yellow-400/20 text-yellow-700 border-yellow-500/30",
  SEVERE: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  CRITICAL: "bg-red-500/20 text-red-700 border-red-500/40"
};

export function WeatherSeverityBadge({ severity, className }: { severity: WeatherSeverity; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-bold uppercase", severityStyles[severity], className)}>
      {severity}
    </span>
  );
}
