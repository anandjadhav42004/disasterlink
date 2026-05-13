"use client";

import { Activity, Clock, MapPin, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandHeaderProps {
  title: string;
  subtitle?: string;
  status?: "operational" | "alert" | "critical";
  statusText?: string;
  lastSync?: string;
  activeOps?: number;
  district?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CommandHeader({
  title,
  subtitle,
  status = "operational",
  statusText,
  lastSync,
  activeOps,
  district,
  children,
  className,
}: CommandHeaderProps) {
  const statusColor = {
    operational: "bg-green-500",
    alert: "bg-amber-500",
    critical: "bg-red-500",
  };

  const statusLabel = statusText || {
    operational: "Systems Operational",
    alert: "Alert Active",
    critical: "Critical Operations",
  }[status];

  return (
    <div className={cn("mb-8", className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn("h-2 w-2 rounded-full animate-pulse", statusColor[status])} />
            <span className={cn(
              "text-label-caps",
              status === "critical" ? "text-error" : status === "alert" ? "text-warning" : "text-on-surface-variant"
            )}>
              {statusLabel}
            </span>
            {activeOps !== undefined && (
              <>
                <span className="text-on-surface-variant/30">·</span>
                <span className="text-label-caps text-on-surface-variant flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {activeOps} Active Ops
                </span>
              </>
            )}
            {district && (
              <>
                <span className="text-on-surface-variant/30">·</span>
                <span className="text-label-caps text-on-surface-variant flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {district}
                </span>
              </>
            )}
          </div>
          <h1 className="text-display-lg text-on-surface">{title}</h1>
          {subtitle && (
            <p className="text-body-base text-on-surface-variant mt-1">{subtitle}</p>
          )}
          {lastSync && (
            <p className="text-mono-data text-on-surface-variant/60 mt-1 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Last sync: {lastSync}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>
    </div>
  );
}
