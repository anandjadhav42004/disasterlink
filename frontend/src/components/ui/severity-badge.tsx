"use client";

import { cn } from "@/lib/utils";

type Severity = "critical" | "high" | "medium" | "low" | "warning" | "info" | "all-clear";
type Status = "active" | "pending" | "resolved" | "monitoring" | "expired" | "in-progress" | "assigned";

interface SeverityBadgeProps {
  severity?: Severity;
  status?: Status;
  label?: string;
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
}

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  "all-clear": "bg-green-100 text-green-800 border-green-200",
};

const statusStyles: Record<string, string> = {
  active: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  monitoring: "bg-blue-100 text-blue-800 border-blue-200",
  expired: "bg-gray-100 text-gray-600 border-gray-200",
  "in-progress": "bg-amber-100 text-amber-800 border-amber-200",
  assigned: "bg-purple-100 text-purple-800 border-purple-200",
};

export function SeverityBadge({
  severity,
  status,
  label,
  size = "sm",
  pulse = false,
  className,
}: SeverityBadgeProps) {
  const type = severity || status || "info";
  const styles = severity ? severityStyles[type] : statusStyles[type];
  const displayLabel = label || type;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded border font-bold uppercase",
      size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
      styles,
      className
    )}>
      {pulse && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full animate-pulse",
          severity === "critical" || status === "active" ? "bg-red-500" :
          severity === "warning" || status === "pending" ? "bg-amber-500" : "bg-current"
        )} />
      )}
      {displayLabel}
    </span>
  );
}
