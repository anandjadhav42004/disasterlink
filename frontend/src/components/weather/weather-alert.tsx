"use client";

import { AlertTriangle } from "lucide-react";
import { WeatherSeverityBadge } from "./weather-severity-badge";
import type { WeatherAlert } from "@/store/weather-store";

export function WeatherAlert({ alert }: { alert: WeatherAlert }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-error" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-base font-bold">{alert.title}</p>
            <WeatherSeverityBadge severity={alert.severity} />
          </div>
          <p className="mt-1 text-body-sm text-on-surface-variant">{alert.message}</p>
          {alert.createdAt && <p className="mt-2 text-mono-data text-on-surface-variant">{new Date(alert.createdAt).toLocaleString()}</p>}
        </div>
      </div>
    </div>
  );
}
