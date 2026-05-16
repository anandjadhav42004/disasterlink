"use client";

import { CloudRain, Layers, LocateFixed, Route, Shield, Siren, Users, Waves } from "lucide-react";
import type { OverlayKey } from "@/store/radar-store";

const controls: Array<{ key: OverlayKey; label: string; icon: typeof CloudRain }> = [
  { key: "rainRadar", label: "Rain Radar", icon: CloudRain },
  { key: "cloudCoverage", label: "Cloud Coverage", icon: Layers },
  { key: "stormMovement", label: "Storm Movement", icon: Route },
  { key: "floodRisk", label: "Flood Risk", icon: Waves },
  { key: "activeSos", label: "Active SOS", icon: Siren },
  { key: "shelters", label: "Shelters", icon: Shield },
  { key: "volunteers", label: "Volunteers", icon: Users },
  { key: "weatherSeverity", label: "Weather Severity", icon: CloudRain },
  { key: "incidentHeatmap", label: "Incident Heatmap", icon: Siren },
  { key: "evacuationZones", label: "Evacuation Zones", icon: Route }
];

interface OperationalMapControlsProps {
  activeLayers: Record<OverlayKey, boolean>;
  onToggle: (layer: OverlayKey) => void;
  onLocate: () => void;
}

export function OperationalMapControls({ activeLayers, onToggle, onLocate }: OperationalMapControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100">Operational Layers</h3>
        <button className="grid h-8 w-8 place-items-center border border-slate-700 bg-slate-900 text-cyan-100 hover:bg-slate-800" onClick={onLocate} aria-label="Locate responder">
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {controls.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className="flex min-h-10 items-center gap-2 border border-slate-700 bg-slate-950 px-2 py-2 text-left text-xs text-slate-300 data-[active=true]:border-cyan-400/60 data-[active=true]:bg-cyan-400/10 data-[active=true]:text-cyan-100"
            data-active={activeLayers[key]}
            onClick={() => onToggle(key)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
