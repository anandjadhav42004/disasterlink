"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultRedirect, hasAnyPermission, hasModule } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth-store";

export default function LegacyDashboardMapRedirectPage() {
  const router = useRouter();
  const access = useAuthStore((state) => state.access);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    const hasAdminMapAccess =
      hasModule(access, "admin") ||
      hasAnyPermission(access, ["users.view", "map.full_access", "emergency.override"]);

    if (hasAdminMapAccess) {
      router.replace("/admin/map");
      return;
    }
    router.replace(defaultRedirect(access));
  }, [access, isHydrated, router]);

  return (
    <div className="grid min-h-[60vh] place-items-center text-body-sm text-on-surface-variant">
      Redirecting to authorized map workspace...
    </div>
  );
}
