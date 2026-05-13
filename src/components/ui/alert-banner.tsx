"use client";

import { cn } from "@/lib/utils";

interface AlertBannerProps {
  variant: "critical" | "warning" | "info" | "success";
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const bannerStyles = {
  critical: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
  success: "border-green-200 bg-green-50 text-green-900",
};

const iconStyles = {
  critical: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
  success: "text-green-600",
};

export function AlertBanner({
  variant,
  icon: Icon,
  title,
  description,
  action,
  dismissible,
  onDismiss,
  className,
}: AlertBannerProps) {
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-md border-2", bannerStyles[variant], className)}>
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconStyles[variant])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-body-sm opacity-80 mt-0.5">{description}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={cn("shrink-0 px-3 py-1 rounded text-xs font-semibold border transition-colors",
            variant === "critical" ? "border-red-300 hover:bg-red-100" :
            variant === "warning" ? "border-amber-300 hover:bg-amber-100" :
            variant === "info" ? "border-blue-300 hover:bg-blue-100" :
            "border-green-300 hover:bg-green-100"
          )}
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button onClick={onDismiss} className="shrink-0 text-current opacity-50 hover:opacity-100 text-lg leading-none" aria-label="Dismiss">×</button>
      )}
    </div>
  );
}
