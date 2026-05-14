"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/store/auth-store";
import { useOperationsStore, type LiveIncident, type LiveShelter } from "@/store/operations-store";

interface EmergencyAlert {
  title?: string;
  message?: string;
}

export function SocketBridge() {
  const { on } = useSocket();
  const logout = useAuthStore((state) => state.logout);
  const upsertIncident = useOperationsStore((state) => state.upsertIncident);
  const upsertShelter = useOperationsStore((state) => state.upsertShelter);

  useEffect(() => {
    const offIncident = on<LiveIncident>("new-incident", (payload) => {
      upsertIncident(payload);
      toast.error("New incident created", { description: payload.description });
    });

    const offEmergency = on<EmergencyAlert>("emergency-alert", (payload) => {
      toast.warning(payload.title || "Emergency alert", {
        description: payload.message
      });
    });

    const offAssigned = on<{ sosId?: string }>("volunteer-assigned", (payload) => {
      toast.success("Volunteer assigned", {
        description: payload.sosId ? `SOS ${payload.sosId} has a responder.` : undefined
      });
    });

    const offStatus = on<{ sosId?: string; status?: string }>("sos-status-update", (payload) => {
      toast.info("SOS status updated", {
        description: [payload.sosId, payload.status].filter(Boolean).join(" - ") || undefined
      });
    });

    const offShelter = on<{ shelter: LiveShelter; action: string }>("shelter-update", (payload) => {
      upsertShelter(payload.shelter);
      toast.info("Shelter updated", { description: `${payload.shelter.name} ${payload.action}` });
    });

    const offRequest = on<LiveIncident>("request-created", (payload) => {
      upsertIncident(payload);
      toast.info("New citizen request", { description: payload.description });
    });

    const offLogout = on<{ reason?: string }>("force-logout", async (payload) => {
      await logout();
      toast.error("Session ended", { description: payload.reason ?? "Your account permissions changed." });
    });

    return () => {
      offIncident();
      offEmergency();
      offAssigned();
      offStatus();
      offShelter();
      offRequest();
      offLogout();
    };
  }, [logout, on, upsertIncident, upsertShelter]);

  return null;
}
