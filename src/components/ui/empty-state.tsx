"use client";

import { FileX, Search, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "search" | "error";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const defaultIcons = {
    default: FileX,
    search: Search,
    error: AlertTriangle,
  };
  const Icon = icon || defaultIcons[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full mb-4",
        variant === "error" ? "bg-red-50" : "bg-surface-container-high"
      )}>
        <Icon className={cn(
          "h-7 w-7",
          variant === "error" ? "text-red-400" : "text-on-surface-variant/40"
        )} />
      </div>
      <h3 className="text-headline-md text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-body-sm text-on-surface-variant max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 flex items-center gap-2 h-9 px-4 rounded bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}
