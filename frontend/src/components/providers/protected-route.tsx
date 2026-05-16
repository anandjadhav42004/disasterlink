"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { canAccessRoute, defaultRedirect } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, shows nothing while verifying auth. Defaults to true. */
  showLoader?: boolean;
}

/**
 * ProtectedRoute wraps authenticated pages.
 * - Redirects unauthenticated users to /login
 * - Redirects unauthorized users to their role-based dashboard
 * - Shows a loading state while hydrating session
 */
export default function ProtectedRoute({ children, showLoader = true }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, isLoading, access, hydrate } = useAuthStore();

  // Hydrate session from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!access) return;

    if (!canAccessRoute(access, pathname)) {
      // User is authenticated but not authorized for this route
      const correctPath = defaultRedirect(access);
      router.replace(correctPath);
    }
  }, [access, isAuthenticated, isHydrated, isLoading, pathname, router]);

  // Show loading while hydrating
  if ((!isHydrated || isLoading || (isAuthenticated && !access)) && showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
            <circle cx="12" cy="12" r="10" stroke="var(--color-outline-variant)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="text-label-caps text-on-surface-variant">VERIFYING CREDENTIALS…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If not authenticated or unauthorized, don't render (redirect will happen)
  if (!isAuthenticated) return null;
  if (!access) return null;
  if (!canAccessRoute(access, pathname)) return null;

  return <>{children}</>;
}
