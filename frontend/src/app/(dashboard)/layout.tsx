"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { FloatingSOS } from "@/components/ui/floating-sos";
import { dashboardNav } from "@/constants/navigation";
import { useNotificationStore } from "@/store/notification-store";
import { useAuthStore } from "@/store/auth-store";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/providers/protected-route";
import { SocketBridge } from "@/components/providers/socket-bridge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useNotificationStore();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useSocket(); // Initialize Socket.IO

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || (isLoading && !isAuthenticated) || !isAuthenticated) return null;

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
