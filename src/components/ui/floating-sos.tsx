"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingSOS() {
  const pathname = usePathname();

  // Show on dashboard routes only, not on the SOS page itself
  const showRoutes = ["/dashboard", "/dashboard/feed", "/dashboard/requests", "/dashboard/map", "/dashboard/profile"];
  const isVisible = showRoutes.some((r) => pathname === r);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50"
        >
          <Link
            href="/dashboard/sos"
            className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-error text-on-error shadow-lg hover:bg-error/90 active:scale-95 transition-all group"
            aria-label="Send SOS Emergency Request"
          >
            <Siren className="h-6 w-6 lg:h-7 lg:w-7 group-hover:animate-pulse" />
          </Link>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-error/20 animate-ping pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
