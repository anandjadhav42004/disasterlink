"use client";

import { CloudRain, Flame, Waves, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeatherMapOverlay, WeatherOverlayMarker } from "@/store/weather-store";

const layerLabels: Record<keyof WeatherMapOverlay["layers"], string> = {
  rainfall: "Rainfall",
  storms: "Storms",
  heatZones: "Heat Zones",
  floodRisk: "Flood Risk",
  cycloneZones: "Cyclone Zones",
  severityMarkers: "Severity"
};

function position(marker: WeatherOverlayMarker) {
  return {
    left: `${Math.min(96, Math.max(4, ((marker.coordinates.lng + 180) / 360) * 100))}%`,
    top: `${Math.min(94, Math.max(6, ((90 - marker.coordinates.lat) / 180) * 100))}%`
  };
}

function markerTone(severity: string) {
  if (severity === "CRITICAL") return "bg-red-500";
  if (severity === "SEVERE") return "bg-orange-500";
  if (severity === "MODERATE") return "bg-yellow-400";
  return "bg-emerald-500";
}

export function WeatherMapOverlay({
  overlay,
  activeLayers,
  onToggleLayer
}: {
  overlay: WeatherMapOverlay | null;
  activeLayers: Record<keyof WeatherMapOverlay["layers"], boolean>;
  onToggleLayer: (layer: keyof WeatherMapOverlay["layers"]) => void;
}) {
  const markers = overlay
    ? (Object.entries(overlay.layers) as Array<[keyof WeatherMapOverlay["layers"], WeatherOverlayMarker[]]>)
        .filter(([layer]) => activeLayers[layer])
        .flatMap(([, items]) => items)
    : [];

  return (
    <>
      {markers.map((marker) => (
        <div key={`${marker.type}-${marker.id}`} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group" style={position(marker)}>
          <div className={cn("h-5 w-5 rounded-full border-2 border-white shadow-lg", markerTone(marker.severity))} />
          <div className={cn("absolute -inset-2 rounded-full opacity-30 blur-sm", markerTone(marker.severity))} />
          <div className="absolute left-1/2 top-7 hidden min-w-44 -translate-x-1/2 rounded-md border border-outline-variant bg-surface p-2 text-body-sm shadow-lg group-hover:block">
            <p className="font-bold">{marker.district}</p>
            <p className="text-on-surface-variant">{marker.label}</p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 right-4 z-30 w-60 rounded-md border border-outline-variant bg-surface/95 p-3 shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center gap-2 text-label-caps text-on-surface-variant">
          <CloudRain className="h-4 w-4" />
          Weather Layers
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {(Object.keys(layerLabels) as Array<keyof WeatherMapOverlay["layers"]>).map((layer) => (
            <label key={layer} className="flex items-center justify-between rounded-md px-2 py-1 text-body-sm hover:bg-surface-container-low">
              <span className="flex items-center gap-2">
                {layer === "heatZones" ? <Flame className="h-3.5 w-3.5" /> : layer === "floodRisk" ? <Waves className="h-3.5 w-3.5" /> : <Wind className="h-3.5 w-3.5" />}
                {layerLabels[layer]}
              </span>
              <input type="checkbox" checked={activeLayers[layer]} onChange={() => onToggleLayer(layer)} />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
