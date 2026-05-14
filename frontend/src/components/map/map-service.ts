import api from "@/services/api";
import type { SOSPin, ShelterPin, HeatmapPoint } from "./map-types";

// ============================================
// Map Data Service
// ============================================

export const mapService = {
  /**
   * Fetch all active SOS pins for the map.
   * Falls back to /sos/nearby if /map/live doesn't exist.
   */
  getLivePins: async (): Promise<SOSPin[]> => {
    try {
      const { data } = await api.get("/map/live");
      return data.data ?? data ?? [];
    } catch {
      // Fallback: use SOS nearby endpoint with large radius
      try {
        const { data } = await api.get("/sos/nearby", {
          params: { lat: 28.6139, lng: 77.209, radius: 100 },
        });
        const items = data.data ?? data ?? [];
        // Normalise the shape from SOS response to SOSPin
        return items.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          type: (s.type as string) ?? "SOS",
          severity: ((s.severity as string) ?? (s.priority as string) ?? "MEDIUM").toUpperCase(),
          status: ((s.status as string) ?? "PENDING").toUpperCase().replace("-", "_"),
          description: (s.description as string) ?? "",
          latitude: (s.latitude as number) ?? (s.location as { lat: number })?.lat ?? 0,
          longitude: (s.longitude as number) ?? (s.location as { lng: number })?.lng ?? 0,
          userName: (s.userName as string) ?? (s.requestedBy as string) ?? "Unknown",
          createdAt: (s.createdAt as string) ?? (s.requestedAt as string) ?? new Date().toISOString(),
        }));
      } catch {
        return [];
      }
    }
  },

  /**
   * Fetch shelter pins for the map.
   */
  getShelters: async (): Promise<ShelterPin[]> => {
    try {
      const { data } = await api.get("/map/shelters");
      return data.data ?? data ?? [];
    } catch {
      // Fallback: use shelters/nearby
      try {
        const { data } = await api.get("/shelters/nearby", {
          params: { lat: 28.6139, lng: 77.209, radius: 100 },
        });
        const items = data.data ?? data ?? [];
        return items.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: (s.name as string) ?? "Shelter",
          address: (s.address as string) ?? "",
          latitude: (s.latitude as number) ?? (s.location as { lat: number })?.lat ?? 0,
          longitude: (s.longitude as number) ?? (s.location as { lng: number })?.lng ?? 0,
          capacity: (s.capacity as number) ?? 0,
          occupied: (s.occupied as number) ?? (s.currentOccupancy as number) ?? 0,
          availableSpace:
            (s.availableSpace as number) ??
            ((s.capacity as number) ?? 0) - ((s.occupied as number) ?? (s.currentOccupancy as number) ?? 0),
        }));
      } catch {
        return [];
      }
    }
  },

  /**
   * Fetch heatmap intensity data.
   */
  getHeatmap: async (): Promise<HeatmapPoint[]> => {
    try {
      const { data } = await api.get("/map/heatmap");
      return data.data ?? data ?? [];
    } catch {
      // Fallback: use admin heatmap
      try {
        const { data } = await api.get("/admin/heatmap");
        return data.data ?? data ?? [];
      } catch {
        return [];
      }
    }
  },
};
