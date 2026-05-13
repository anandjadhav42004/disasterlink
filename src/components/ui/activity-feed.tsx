"use client";

import { AlertTriangle, Users, Home, Radio, Shield, Zap, TrendingUp, Activity } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
}

interface ActivityFeedProps {
  items: FeedItem[];
  maxHeight?: string;
  showHeader?: boolean;
  title?: string;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  incident_created: AlertTriangle,
  incident_resolved: Shield,
  alert_issued: Radio,
  volunteer_deployed: Users,
  shelter_opened: Home,
  sos_received: Zap,
  resource_dispatched: TrendingUp,
};

export function ActivityFeed({
  items,
  maxHeight = "500px",
  showHeader = true,
  title = "Live Activity Feed",
  className,
}: ActivityFeedProps) {
  return (
    <div className={cn("rounded-md border border-outline-variant bg-surface-container-lowest", className)}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Radio className="h-4 w-4 text-primary" />
            <h2 className="text-title-sm text-on-surface">{title}</h2>
          </div>
          <span className="text-mono-data text-on-surface-variant/50">LIVE</span>
        </div>
      )}
      <div className="divide-y divide-outline-variant overflow-y-auto" style={{ maxHeight }}>
        {items.map((item) => {
          const Icon = iconMap[item.type] || Activity;
          return (
            <div key={item.id} className="p-4 hover:bg-surface-container transition-colors">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-surface-container-high">
                  <Icon className="h-4 w-4 text-on-surface-variant" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-on-surface">{item.title}</p>
                  <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-mono-data text-on-surface-variant/60">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                    {item.actor && (
                      <>
                        <span className="text-on-surface-variant/30">·</span>
                        <span className="text-[11px] text-on-surface-variant/60">{item.actor}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
