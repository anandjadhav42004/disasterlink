"use client";

import { MapPin, Layers, ZoomIn, ZoomOut, LocateFixed, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: "emergency" | "shelter" | "volunteer" | "medical" | "command";
  label: string;
  pulse?: boolean;
}

interface OperationalMapProps {
  pins?: MapPin[];
  height?: string;
  showControls?: boolean;
  showLegend?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const pinColors = {
  emergency: "bg-red-500",
  shelter: "bg-green-500",
  volunteer: "bg-blue-500",
  medical: "bg-orange-500",
  command: "bg-purple-500",
};

const legendItems = [
  { color: "bg-red-500", label: "Active Emergency" },
  { color: "bg-green-500", label: "Open Shelter" },
  { color: "bg-blue-500", label: "Deployed Volunteer" },
  { color: "bg-orange-500", label: "Medical Facility" },
  { color: "bg-purple-500", label: "Command Post" },
];

export function OperationalMap({
  pins = [],
  height = "400px",
  showControls = true,
  showLegend = true,
  className,
  children,
}: OperationalMapProps) {
  return (
    <div className={cn("relative rounded-md border border-outline-variant overflow-hidden", className)} style={{ height }}>
      {/* Map Background */}
      <div className="absolute inset-0 bg-surface-container">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(to right, var(--color-on-surface) 1px, transparent 1px), linear-gradient(to bottom, var(--color-on-surface) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      {/* Placeholder text */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="text-center">
          <MapPin className="h-10 w-10 text-on-surface-variant/15 mx-auto mb-2" />
          <p className="text-body-sm text-on-surface-variant/40">Operational Map — Mapbox GL JS</p>
        </div>
      </div>

      {/* Sample Pins */}
      {pins.map((pin, idx) => {
        const positions = [
          { top: "25%", left: "30%" },
          { top: "40%", left: "60%" },
          { top: "55%", left: "45%" },
          { top: "35%", left: "70%" },
          { top: "65%", left: "25%" },
          { top: "50%", left: "50%" },
        ];
        const pos = positions[idx % positions.length];
        return (
          <div key={pin.id} className="absolute z-10" style={pos}>
            <div className="relative group">
              <div className={cn(
                "h-4 w-4 rounded-full border-2 border-white shadow-lg",
                pinColors[pin.type],
                pin.pulse && "animate-pulse"
              )} />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-inverse-surface text-inverse-on-surface text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {pin.label}
              </div>
            </div>
          </div>
        );
      })}

      {/* Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
          {[
            { icon: ZoomIn, label: "Zoom in" },
            { icon: ZoomOut, label: "Zoom out" },
            { icon: LocateFixed, label: "My location" },
            { icon: Layers, label: "Layers" },
            { icon: Maximize2, label: "Fullscreen" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex h-9 w-9 items-center justify-center rounded bg-surface-container-lowest/90 border border-outline-variant text-on-surface-variant hover:bg-surface-container-lowest transition-colors shadow-sm backdrop-blur-sm" aria-label={label}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 w-48 p-3 rounded-md bg-surface-container-lowest/90 border border-outline-variant shadow-sm backdrop-blur-sm z-20">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Legend</h3>
          <div className="space-y-1.5">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                <span className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom children overlay */}
      {children}
    </div>
  );
}
