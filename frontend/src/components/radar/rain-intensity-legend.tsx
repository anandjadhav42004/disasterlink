"use client";

const bands = [
  { label: "Light", color: "#38bdf8", value: "0-35" },
  { label: "Moderate", color: "#22c55e", value: "36-61" },
  { label: "Heavy", color: "#f59e0b", value: "62-81" },
  { label: "Critical", color: "#ef4444", value: "82+" }
];

export function RainIntensityLegend({ intensity }: { intensity?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-slate-400">Rain Intensity</span>
        <span className="font-mono text-xs text-cyan-100">{Math.round(intensity ?? 0)}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-slate-900">
        <div className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-red-500" style={{ width: `${Math.min(100, Math.max(2, intensity ?? 0))}%` }} />
      </div>
      <div className="grid grid-cols-4 gap-1">
        {bands.map((band) => (
          <div key={band.label} className="min-w-0">
            <div className="h-1 rounded" style={{ backgroundColor: band.color }} />
            <p className="mt-1 truncate text-[10px] text-slate-400">{band.label}</p>
            <p className="font-mono text-[10px] text-slate-500">{band.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
