import { create } from "zustand";
import { adminService, shelterService } from "@/services";

type ApiEnvelope<T> = { data: { data: T } };

export interface LiveIncident {
  id: string;
  type: string;
  description?: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt?: string;
  user?: { name?: string; district?: string; state?: string };
  volunteer?: { id: string; user?: { name?: string } } | null;
}

export interface LiveShelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  address?: string | null;
  contact?: string | null;
  district?: string | null;
  state?: string | null;
  status?: string;
  emergencyCapacity?: boolean;
  resources?: Record<string, unknown>;
}

export interface LiveVolunteer {
  id: string;
  isAvailable: boolean;
  user?: { id: string; name: string; email: string; district?: string | null };
  assignedRequests?: LiveIncident[];
}

interface OperationsState {
  incidents: LiveIncident[];
  shelters: LiveShelter[];
  volunteers: LiveVolunteer[];
  activeLayers: Record<"heatmap" | "incidents" | "shelters" | "volunteers" | "routes", boolean>;
  isLoading: boolean;
  error: string | null;
  fetchIncidents: (params?: Record<string, unknown>) => Promise<void>;
  createIncident: (payload: Record<string, unknown>) => Promise<LiveIncident>;
  updateIncident: (id: string, payload: Record<string, unknown>) => Promise<LiveIncident>;
  declareEmergency: (payload: Record<string, unknown>) => Promise<void>;
  fetchShelters: (params?: Record<string, unknown>) => Promise<void>;
  createShelter: (payload: Record<string, unknown>) => Promise<LiveShelter>;
  updateShelter: (id: string, payload: Record<string, unknown>) => Promise<LiveShelter>;
  deleteShelter: (id: string) => Promise<void>;
  fetchVolunteers: () => Promise<void>;
  toggleLayer: (layer: keyof OperationsState["activeLayers"]) => void;
  upsertIncident: (incident: LiveIncident) => void;
  upsertShelter: (shelter: LiveShelter) => void;
}

function unwrap<T>(response: ApiEnvelope<T>) {
  return response.data.data;
}

export const useOperationsStore = create<OperationsState>((set, get) => ({
  incidents: [],
  shelters: [],
  volunteers: [],
  activeLayers: { heatmap: true, incidents: true, shelters: true, volunteers: false, routes: false },
  isLoading: false,
  error: null,

  fetchIncidents: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const incidents = unwrap<LiveIncident[]>(await adminService.getIncidents(params));
      set({ incidents, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load incidents", isLoading: false });
    }
  },

  createIncident: async (payload) => {
    const optimistic = { id: `pending-${Date.now()}`, status: "PENDING", severity: String(payload.severity ?? "MEDIUM"), type: String(payload.type ?? "OTHER"), latitude: Number(payload.latitude), longitude: Number(payload.longitude), description: String(payload.title ?? ""), createdAt: new Date().toISOString() };
    set({ incidents: [optimistic, ...get().incidents] });
    const incident = unwrap<LiveIncident>(await adminService.createIncident(payload));
    get().upsertIncident(incident);
    return incident;
  },

  updateIncident: async (id, payload) => {
    set({ incidents: get().incidents.map((incident) => (incident.id === id ? { ...incident, ...payload } as LiveIncident : incident)) });
    const incident = unwrap<LiveIncident>(await adminService.updateIncident(id, payload));
    get().upsertIncident(incident);
    return incident;
  },

  declareEmergency: async (payload) => {
    await adminService.declareEmergency(payload);
    await get().fetchIncidents();
  },

  fetchShelters: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const shelters = unwrap<LiveShelter[]>(await shelterService.getAll(params));
      set({ shelters, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load shelters", isLoading: false });
    }
  },

  createShelter: async (payload) => {
    const shelter = unwrap<LiveShelter>(await shelterService.create(payload));
    get().upsertShelter(shelter);
    return shelter;
  },

  updateShelter: async (id, payload) => {
    const shelter = unwrap<LiveShelter>(await shelterService.update(id, payload));
    get().upsertShelter(shelter);
    return shelter;
  },

  deleteShelter: async (id) => {
    await shelterService.delete(id);
    set({ shelters: get().shelters.filter((shelter) => shelter.id !== id) });
  },

  fetchVolunteers: async () => {
    const volunteers = unwrap<LiveVolunteer[]>(await adminService.getVolunteers().catch(() => ({ data: { data: [] } } as ApiEnvelope<LiveVolunteer[]>)));
    set({ volunteers });
  },

  toggleLayer: (layer) => set({ activeLayers: { ...get().activeLayers, [layer]: !get().activeLayers[layer] } }),

  upsertIncident: (incident) => {
    const rest = get().incidents.filter((item) => item.id !== incident.id && !item.id.startsWith("pending-"));
    set({ incidents: [incident, ...rest] });
  },

  upsertShelter: (shelter) => {
    const exists = get().shelters.some((item) => item.id === shelter.id);
    set({ shelters: exists ? get().shelters.map((item) => (item.id === shelter.id ? shelter : item)) : [shelter, ...get().shelters] });
  },
}));
