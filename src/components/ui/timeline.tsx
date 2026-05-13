"use client";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "completed" | "active" | "pending";
  actor?: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

export function Timeline({ entries, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-3 w-3 rounded-full border-2 mt-1.5 shrink-0",
                entry.status === "completed" ? "bg-green-500 border-green-300" :
                entry.status === "active" ? "bg-primary border-primary/30 animate-pulse" :
                "bg-surface-container-high border-outline-variant"
              )} />
              {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-outline-variant" />}
            </div>
            <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
              <p className="text-sm font-medium text-on-surface">{entry.title}</p>
              {entry.description && (
                <p className="text-body-sm text-on-surface-variant mt-0.5">{entry.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1 text-mono-data text-on-surface-variant/60">
                <span>{formatRelativeTime(entry.timestamp)}</span>
                {entry.actor && (
                  <>
                    <span className="text-on-surface-variant/30">·</span>
                    <span>{entry.actor}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
