"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { FloatingSOS } from "@/components/ui/floating-sos";
import { dashboardNav } from "@/constants/navigation";
import { useNotificationStore } from "@/store/notification-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useNotificationStore();

  return (
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
      <FloatingSOS />
    </div>
  );
}
