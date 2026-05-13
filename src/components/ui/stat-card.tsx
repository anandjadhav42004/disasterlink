"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  change?: string;
  trend?: "up" | "down" | "stable";
  trendPositive?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  change,
  trend,
  trendPositive,
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className={cn(
      "p-5 rounded-md border border-outline-variant bg-surface-container-lowest transition-colors hover:border-primary/20",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        {trend && (
          <TrendIcon className={cn(
            "h-4 w-4",
            trendPositive ? "text-green-500" : trend === "stable" ? "text-blue-500" : "text-red-500",
            trend === "down" && !trendPositive && "rotate-0"
          )} />
        )}
      </div>
      <p className="text-2xl font-bold text-on-surface font-mono">{value}</p>
      <p className="text-body-sm text-on-surface-variant">{label}</p>
      {change && (
        <p className="text-[11px] text-on-surface-variant/70 mt-1">{change}</p>
      )}
    </div>
  );
}
