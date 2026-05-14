"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Home, Layers, LocateFixed, Radio, RefreshCw, Users } from "lucide-react";
import { mapService } from "@/services";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

interface ApiEnvelope<T> {
  data: T;
}

interface LiveIncident {
  id: string;
  type: string;
  severity: string;
  status: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface LiveShelter {
  id: string;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
}

interface LiveVolunteer {
  id: string;
  isAvailable: boolean;
  user: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

interface LiveMapData {
  incidents: LiveIncident[];
  shelters: LiveShelter[];
  volunteers: LiveVolunteer[];
}

const DEFAULT_DATA: LiveMapData = { incidents: [], shelters: [], volunteers: [] };

function markerPosition(latitude: number, longitude: number) {
  const left = ((longitude + 180) / 360) * 100;
  const top = ((90 - latitude) / 180) * 100;
  return {
    left: `${Math.min(96, Math.max(4, left))}%`,
    top: `${Math.min(94, Math.max(6, top))}%`
  };
}

function severityTone(severity: string) {
  const normalized = severity.toLowerCase();
  if (normalized === "critical") return "bg-error text-on-error border-error";
  if (normalized === "high") return "bg-tertiary text-on-tertiary border-tertiary";
  return "bg-primary text-on-primary border-primary";
}

export default function LiveMapPage() {
  const { on, isConnected } = useSocket();
  const [data, setData] = useState<LiveMapData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [layers, setLayers] = useState({ shelters: true, volunteers: true, incidents: true, heatmap: false, routes: false });
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const loadMap = useCallback(async () => {
    try {
      setError(null);
      const response = await mapService.getLive();
      setData((response.data as ApiEnvelope<LiveMapData>).data || DEFAULT_DATA);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError("Live map data could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMap();
  }, [loadMap]);

  useEffect(() => {
    return on("map-update", () => {
      loadMap();
    });
  }, [loadMap, on]);

  const activeIncidents = useMemo(
    () => data.incidents.filter((incident) => incident.status !== "RESOLVED" && incident.status !== "CANCELLED"),
    [data.incidents]
  );

  const locateMe = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMyLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => setError("Geolocation permission was denied or unavailable."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <main className="flex-grow flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-surface border-b border-outline-variant px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-title-sm text-primary flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Live Disaster Map
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            {lastUpdated ? `Last refreshed ${lastUpdated}` : "Waiting for live data"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-label-caps px-3 py-1.5 rounded-md", isConnected ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant")}>
            {isConnected ? "SOCKET LIVE" : "SOCKET OFFLINE"}
          </span>
          <button
            onClick={loadMap}
            className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-md text-label-caps hover:bg-surface-container-highest transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative bg-surface-dim">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "32px 32px" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(to right, #6750a4 1px, transparent 1px), linear-gradient(to bottom, #6750a4 1px, transparent 1px)", backgroundSize: "96px 96px" }} />

          {isLoading && (
            <div className="absolute inset-0 grid place-items-center text-body-sm text-on-surface-variant">
              Loading live map...
            </div>
          )}

          {error && !isLoading && (
            <div className="absolute top-4 left-4 right-4 bg-error-container text-on-error-container border border-error/30 rounded-md p-3 text-body-sm">
              {error}
            </div>
          )}

          {layers.heatmap && activeIncidents.map((incident) => (
            <div key={`heat-${incident.id}`} className="absolute -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-error/20 blur-xl" style={markerPosition(incident.latitude, incident.longitude)} />
          ))}

          {layers.shelters && data.shelters.map((shelter) => (
            <div key={shelter.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group" style={markerPosition(shelter.latitude, shelter.longitude)}>
              <div className="h-6 w-6 rounded-full bg-primary text-on-primary border-2 border-white shadow-lg grid place-items-center">
                <Home className="h-3.5 w-3.5" />
              </div>
              <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden group-hover:block min-w-44 rounded-md border border-outline-variant bg-surface p-2 shadow-lg text-body-sm">
                <p className="font-bold">{shelter.name}</p>
                <p className="text-on-surface-variant">{shelter.occupied}/{shelter.capacity} occupied</p>
              </div>
            </div>
          ))}

          {layers.volunteers && data.volunteers.map((volunteer) => {
            const latitude = volunteer.user.latitude;
            const longitude = volunteer.user.longitude;
            if (latitude == null || longitude == null) return null;
            return (
              <div key={volunteer.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group" style={markerPosition(latitude, longitude)}>
                <div className="h-5 w-5 rounded-full bg-blue-500 text-white border-2 border-white shadow-lg grid place-items-center">
                  <Users className="h-3 w-3" />
                </div>
                <div className="absolute left-1/2 top-7 -translate-x-1/2 hidden group-hover:block min-w-40 rounded-md border border-outline-variant bg-surface p-2 shadow-lg text-body-sm">
                  <p className="font-bold">{volunteer.user.name}</p>
                  <p className="text-on-surface-variant">Available responder</p>
                </div>
              </div>
            );
          })}

          {layers.incidents && activeIncidents.map((incident) => (
            <div key={incident.id} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group" style={markerPosition(incident.latitude, incident.longitude)}>
              <div className="absolute inset-0 h-9 w-9 -translate-x-1.5 -translate-y-1.5 rounded-full bg-error/20 animate-ping" />
              <div className={cn("relative h-6 w-6 rounded-full border-2 border-white shadow-lg grid place-items-center", severityTone(incident.severity))}>
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden group-hover:block min-w-52 rounded-md border border-outline-variant bg-surface p-2 shadow-lg text-body-sm">
                <p className="font-bold">{incident.type} SOS</p>
                <p className="text-on-surface-variant">{incident.severity} / {incident.status}</p>
                {incident.description && <p className="mt-1 text-on-surface-variant">{incident.description}</p>}
              </div>
            </div>
          ))}

          {myLocation && (
            <div className="absolute z-30 -translate-x-1/2 -translate-y-1/2" style={markerPosition(myLocation.latitude, myLocation.longitude)}>
              <div className="h-5 w-5 rounded-full bg-blue-700 border-2 border-white shadow" title="My location" />
            </div>
          )}

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button onClick={() => setShowLayers((value) => !value)} className="w-10 h-10 rounded-md bg-surface shadow border border-outline-variant grid place-items-center text-primary" aria-label="Layers">
              <Layers className="h-4 w-4" />
            </button>
            <button onClick={locateMe} className="w-10 h-10 rounded-md bg-surface shadow border border-outline-variant grid place-items-center text-primary" aria-label="My location">
              <LocateFixed className="h-4 w-4" />
            </button>
            {showLayers && (
              <div className="absolute right-12 top-0 bg-surface border border-outline-variant rounded-md shadow p-3 w-56 space-y-2">
                {Object.entries(layers).map(([key, enabled]) => (
                  <label key={key} className="flex items-center justify-between text-body-sm">
                    <span className="capitalize">{key}</span>
                    <input type="checkbox" checked={enabled} onChange={() => setLayers((current) => ({ ...current, [key]: !current[key as keyof typeof layers] }))} />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur p-4 rounded-md border border-outline-variant shadow-lg">
            <h4 className="text-label-caps text-on-surface-variant mb-2">Legend</h4>
            <div className="space-y-1.5 text-body-sm">
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-error" />Active SOS</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" />Shelter</div>
              <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" />Volunteer</div>
            </div>
          </div>
        </div>

        <aside className="w-[340px] bg-surface border-l border-outline-variant hidden lg:flex flex-col">
          <div className="p-4 border-b border-outline-variant">
            <h3 className="text-title-sm flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-error" />
              Active Incidents ({activeIncidents.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant">
            {activeIncidents.length === 0 && (
              <div className="p-4 text-body-sm text-on-surface-variant">No active incidents reported.</div>
            )}
            {activeIncidents.map((incident) => (
              <div key={incident.id} className="p-4 hover:bg-surface-container-low transition-colors border-l-4 border-error">
                <span className="text-label-caps text-error">{incident.severity}</span>
                <p className="text-body-base font-bold mt-1">{incident.type} SOS</p>
                <p className="text-body-sm text-on-surface-variant">{incident.description || "No description provided"}</p>
                <p className="text-mono-data text-on-surface-variant mt-1">{new Date(incident.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
