import api from "./api";

// ============================================
// INCIDENT SERVICE
// ============================================
export const incidentService = {
  getAll: async (params?: { status?: string; severity?: string; page?: number }) =>
    api.get("/incidents", { params }),
  getById: async (id: string) => api.get(`/incidents/${id}`),
  create: async (data: Record<string, unknown>) => api.post("/incidents", data),
  update: async (id: string, data: Record<string, unknown>) => api.patch(`/incidents/${id}`, data),
  delete: async (id: string) => api.delete(`/incidents/${id}`),
  getTimeline: async (id: string) => api.get(`/incidents/${id}/timeline`),
};

// ============================================
// ALERT SERVICE
// ============================================
export const alertService = {
  getAll: async (params?: { severity?: string; status?: string }) =>
    api.get("/alerts", { params }),
  getById: async (id: string) => api.get(`/alerts/${id}`),
  broadcast: async (data: Record<string, unknown>) => api.post("/alerts/broadcast", data),
  dismiss: async (id: string) => api.patch(`/alerts/${id}/dismiss`),
};

// ============================================
// SHELTER SERVICE
// ============================================
export const shelterService = {
  getAll: async (params?: { status?: string; district?: string }) =>
    api.get("/shelters", { params }),
  getById: async (id: string) => api.get(`/shelters/${id}`),
  create: async (data: Record<string, unknown>) => api.post("/shelters", data),
  update: async (id: string, data: Record<string, unknown>) => api.patch(`/shelters/${id}`, data),
  updateCapacity: async (id: string, data: { current: number }) =>
    api.patch(`/shelters/${id}/capacity`, data),
};

// ============================================
// VOLUNTEER SERVICE
// ============================================
export const volunteerService = {
  getAll: async (params?: { status?: string; specialty?: string }) =>
    api.get("/volunteers", { params }),
  getById: async (id: string) => api.get(`/volunteers/${id}`),
  deploy: async (id: string, data: { incidentId: string; sector: string }) =>
    api.post(`/volunteers/${id}/deploy`, data),
  updateStatus: async (id: string, status: string) =>
    api.patch(`/volunteers/${id}/status`, { status }),
};

// ============================================
// SOS SERVICE
// ============================================
export const sosService = {
  submit: async (data: Record<string, unknown>) => api.post("/sos", data),
  getMyRequests: async () => api.get("/sos/me"),
  getById: async (id: string) => api.get(`/sos/${id}`),
  cancel: async (id: string) => api.patch(`/sos/${id}/cancel`),
};

// ============================================
// ANALYTICS SERVICE
// ============================================
export const analyticsService = {
  getDashboard: async () => api.get("/analytics/dashboard"),
  getIncidentTrends: async (params?: { period?: string }) =>
    api.get("/analytics/incidents/trends", { params }),
  getResponseMetrics: async () => api.get("/analytics/response-metrics"),
  getResourceAllocation: async () => api.get("/analytics/resources"),
  exportReport: async (params: { format: string; dateRange?: string }) =>
    api.get("/analytics/export", { params, responseType: "blob" }),
};

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  login: async (data: { email: string; password: string }) => api.post("/auth/login", data),
  register: async (data: Record<string, unknown>) => api.post("/auth/register", data),
  verifyOtp: async (data: { email: string; code: string }) => api.post("/auth/verify", data),
  resendOtp: async (email: string) => api.post("/auth/resend-otp", { email }),
  logout: async () => api.post("/auth/logout"),
  getProfile: async () => api.get("/auth/profile"),
  updateProfile: async (data: Record<string, unknown>) => api.patch("/auth/profile", data),
};

// ============================================
// MAP SERVICE
// ============================================
export const mapService = {
  getIncidentPins: async () => api.get("/map/incidents"),
  getShelterPins: async () => api.get("/map/shelters"),
  getVolunteerPins: async () => api.get("/map/volunteers"),
  getHeatmapData: async () => api.get("/map/heatmap"),
  getDistrictOverlays: async () => api.get("/map/districts"),
};
