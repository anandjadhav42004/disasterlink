"use client";

import type { FloodRiskZone, OperationalRisk, RadarOverlayMarker, StormTrack } from "@/store/radar-store";

function position(lat: number, lng: number) {
  return {
    left: `${Math.min(96, Math.max(4, ((lng + 180) / 360) * 100))}%`,
    top: `${Math.min(94, Math.max(6, ((90 - lat) / 180) * 100))}%`
  };
}

function color(severity: string) {
  if (severity === "CRITICAL") return "bg-red-500";
  if (severity === "SEVERE") return "bg-orange-500";
  if (severity === "MODERATE") return "bg-amber-400";
  return "bg-emerald-400";
}

function rgbaColor(severity: string, alpha: number) {
  if (severity === "CRITICAL") return `rgba(239, 68, 68, ${alpha})`;
  if (severity === "SEVERE") return `rgba(249, 115, 22, ${alpha})`;
  if (severity === "MODERATE") return `rgba(250, 204, 21, ${alpha})`;
  return `rgba(34, 197, 94, ${alpha})`;
}

export function RadarOverlayMarkers({
  markers,
  zones,
  storms,
  risks
}: {
  markers?: RadarOverlayMarker[];
  zones?: FloodRiskZone[];
  storms?: StormTrack[];
  risks?: OperationalRisk[];
}) {
  return (
    <>
      {zones?.map((zone) => (
        <div key={zone.id} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={position(zone.coordinates.lat, zone.coordinates.lng)}>
          <div className="h-28 w-28 animate-pulse rounded-full blur-xl" style={{ backgroundColor: rgbaColor(zone.severity, 0.25) }} />
          <div className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full ${color(zone.severity)} ring-2 ring-white/60`} />
        </div>
      ))}
      {storms?.map((storm) => (
        <div key={storm.id} className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2" style={position(storm.centroid.lat, storm.centroid.lng)}>
          <div className="h-12 w-12 rounded-full border border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_26px_rgba(103,232,249,0.25)]" />
          <div className="absolute left-6 top-6 h-16 w-0.5 origin-top bg-cyan-200/70" style={{ transform: `rotate(${storm.direction}deg)` }} />
        </div>
      ))}
      {risks?.map((risk) => (
        <div key={risk.district} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={position(risk.coordinates.lat, risk.coordinates.lng)}>
          <div className={`h-3 w-3 rounded-full ${color(risk.level)} ring-4 ring-white/10`} />
        </div>
      ))}
      {markers?.map((item) => (
        <div key={item.id} className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2" style={position(item.coordinates.lat, item.coordinates.lng)}>
          <div className={`h-2.5 w-2.5 rounded-full ${color(item.severity)} opacity-80`} />
        </div>
      ))}
    </>
  );
}
