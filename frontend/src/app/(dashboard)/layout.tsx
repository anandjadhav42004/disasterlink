"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { FloatingSOS } from "@/components/ui/floating-sos";
import { dashboardNav } from "@/constants/navigation";
import { useNotificationStore } from "@/store/notification-store";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/providers/protected-route";
import { SocketBridge } from "@/components/providers/socket-bridge";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useNotificationStore();
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/map")) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar
          navItems={dashboardNav}
          title="Citizen Portal"
          subtitle="Emergency Services"
        />
        <main
          id="main-content"
          className={cn(
            "min-h-screen pb-20 lg:pb-0 transition-all duration-300",
            sidebarOpen ? "lg:ml-[280px]" : "lg:ml-[72px]"
          )}
        >
          {children}
        </main>
        <SocketBridge />
        <FloatingSOS />
      </div>
    </ProtectedRoute>
  );
}
