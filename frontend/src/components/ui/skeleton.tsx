"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded bg-surface-container-high", className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-md border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-9 w-9 rounded" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-7 w-20 mb-2" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-outline-variant">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn("h-4", i === 0 ? "w-48" : i === 1 ? "w-16" : "w-20")} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-9 w-9 rounded shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-36 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full rounded-full mb-3" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
    </div>
  );
}

export function FeedItemSkeleton() {
  return (
    <div className="p-4 flex gap-3">
      <Skeleton className="h-10 w-10 rounded shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-3 w-64 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto">
      <div className="mb-8">
        <Skeleton className="h-3 w-32 mb-3" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
