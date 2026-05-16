import api from "./api";

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  register: async (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role?: string;
  }) => api.post("/auth/register", data),

  login: async (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  refresh: async (data: { refreshToken: string }) =>
    api.post("/auth/refresh", data),

  verifyOtp: async (data: { userId?: string; otp?: string; email?: string; code?: string }) =>
    api.post("/auth/verify-otp", data),

  resendOtp: async (data: { email: string }) =>
    api.post("/auth/resend-otp", data),

  forgotPassword: async (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  verifyResetCode: async (data: { email: string; code: string }) =>
    api.post("/auth/verify-reset-code", data),

  resetPassword: async (data: { email: string; code: string; password: string }) =>
    api.post("/auth/reset-password", data),

  startSso: async (data: { provider: "mock" | "google" | "microsoft" | "government"; redirectUri?: string }) =>
    api.post("/auth/sso/start", data),

  completeSso: async (data: { provider: "mock" | "google" | "microsoft" | "government"; code: string; redirectUri?: string }) =>
    api.post("/auth/sso/callback", data),

  logout: async (data?: { refreshToken?: string }) =>
    api.post("/auth/logout", data ?? {}),

  me: async () => api.get("/auth/me"),

  updateFcmToken: async (data: { fcmToken: string }) =>
    api.patch("/auth/fcm-token", data),
};

// ============================================
// SOS SERVICE
// ============================================
export const sosService = {
  // data must be FormData when sending an image, plain object otherwise
  create: async (data: FormData | Record<string, unknown>) =>
    api.post("/sos/create", data, {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    }),

  submit: async (data: Record<string, unknown>) => api.post("/sos/create", data),

  nearby: async (params: { lat: number; lng: number; radius?: number }) =>
    api.get("/sos/nearby", { params }),

  getNearby: async (params: { latitude: number; longitude: number; radiusKm?: number }) =>
    api.get("/sos/nearby", { params }),

  myRequests: async () => api.get("/sos/my"),
  getMyRequests: async () => api.get("/sos/my"),

  getById: async (id: string) => api.get(`/sos/${id}`),

  updateStatus: async (id: string, data: { status: string } | string) => {
    const payload = typeof data === "string" ? { status: data } : data;
    return api.patch(`/sos/${id}/status`, payload);
  },
};

// ============================================
// SHELTER SERVICE
// ============================================
export const shelterService = {
  nearby: async (params?: { lat?: number; lng?: number; radius?: number }) =>
    api.get("/shelters/nearby", { params }),

  getNearby: async (params: { latitude: number; longitude: number; radiusKm?: number }) =>
    api.get("/shelters/nearby", { params }),

  getAll: async (params?: { status?: string; district?: string }) =>
    api.get("/shelters", { params }),

  getById: async (id: string) => api.get(`/shelters/${id}`),

  create: async (data: Record<string, unknown>) =>
    api.post("/shelters", data),

  update: async (id: string, data: Record<string, unknown>) => 
    api.patch(`/shelters/${id}`, data),

  delete: async (id: string) => api.delete(`/shelters/${id}`),

  updateOccupancy: async (id: string, data: { occupied: number }) =>
    api.patch(`/shelters/${id}/occupancy`, data),

  updateCapacity: async (id: string, data: { current: number }) =>
    api.patch(`/shelters/${id}/capacity`, data),
};

// ============================================
// ALERT SERVICE
// ============================================
export const alertService = {
  getAll: async () => api.get("/alerts"),

  create: async (data: {
    title: string;
    message: string;
    severity: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) => api.post("/alerts", data),

  delete: async (id: string) => api.delete(`/alerts/${id}`),
};

// ============================================
// VOLUNTEER SERVICE
// ============================================
export const volunteerService = {
  getTasks: async () => api.get("/volunteer/tasks"),

  acceptTask: async (id: string) => api.post(`/volunteer/accept/${id}`),
  accept: async (id: string) => api.post(`/volunteer/accept/${id}`),

  completeTask: async (id: string) => api.post(`/volunteer/complete/${id}`),
  complete: async (id: string) => api.post(`/volunteer/complete/${id}`),

  updateAvailability: async (data: { isAvailable: boolean } | boolean) => {
    const payload = typeof data === "boolean" ? { isAvailable: data } : data;
    return api.patch("/volunteer/availability", payload);
  },

  getStats: async () => api.get("/volunteer/stats"),
};

// ============================================
// ADMIN SERVICE
// ============================================
export const adminService = {
  getAnalytics: async (params?: { range?: string }) => api.get("/admin/analytics", { params }),

  getIncidents: async (params?: Record<string, unknown>) => api.get("/admin/incidents", { params }),

  createIncident: async (data: Record<string, unknown>) =>
    api.post("/admin/incidents", data),

  updateIncident: async (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/incidents/${id}`, data),

  declareEmergency: async (data: Record<string, unknown>) =>
    api.post("/admin/declare-emergency", data),

  getVolunteers: async () => api.get("/admin/volunteers"),

  broadcast: async (data: Record<string, unknown>) =>
    api.post("/admin/broadcast", data),

  getHeatmap: async () => api.get("/admin/heatmap"),

  getAudit: async (params?: { take?: number }) => api.get("/admin/audit", { params }),
};

// ============================================
// USER MANAGEMENT SERVICE
// ============================================
export const userService = {
  getAll: async (params?: Record<string, unknown>) => api.get("/users", { params }),
  create: async (data: Record<string, unknown>) => api.post("/users", data),
  update: async (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  bulkSuspend: async (ids: string[]) => api.patch("/users/bulk/suspend", { ids }),
  delete: async (id: string) => api.delete(`/users/${id}`),
  resetPassword: async (id: string) => api.post(`/users/${id}/reset-password`),
  updateProfile: async (data: Record<string, unknown>) => api.patch("/users/profile", data),
  deactivate: async () => api.post("/users/deactivate"),
};

export const requestService = {
  create: async (data: Record<string, unknown>) => api.post("/requests", data),
};

export const contactService = {
  submit: async (data: Record<string, unknown>) => api.post("/contact", data),
};

// ============================================
// RBAC / SUPER ADMIN SERVICE
// ============================================
export const roleService = {
  getRoles: async () => api.get("/roles"),
  getRole: async (slug: string) => api.get(`/roles/${slug}`),
  createRole: async (data: Record<string, unknown>) => api.post("/roles", data),
  updateRole: async (slug: string, data: Record<string, unknown>) => api.patch(`/roles/${slug}`, data),
  deleteRole: async (slug: string) => api.delete(`/roles/${slug}`),
  assignRole: async (data: { userId: string; roleSlug: string; district?: string; state?: string; country?: string }) =>
    api.post("/roles/assign", data),
  getPermissions: async () => api.get("/roles/permissions"),
  getAuditLogs: async () => api.get("/roles/audit"),
  getSessions: async () => api.get("/roles/sessions"),
};

// ============================================
// MAP SERVICE
// ============================================
export const mapService = {
  getLive: async () => api.get("/map/live"),
  getShelters: async (params?: { latitude?: number; longitude?: number; radiusKm?: number }) =>
    api.get("/map/shelters", { params }),
  getHeatmapData: async () => api.get("/map/heatmap"),
};

// ============================================
// WEATHER INTELLIGENCE SERVICE
// ============================================
export const weatherService = {
  current: async (city = "Mumbai") => api.get("/weather/current", { params: { city } }),
  forecast: async (city = "Mumbai") => api.get("/weather/forecast", { params: { city } }),
  alerts: async (city = "Mumbai") => api.get("/weather/alerts", { params: { city } }),
  district: async (district: string, coordinates?: { lat: number; lng: number; displayName?: string }) =>
    api.get(`/weather/district/${encodeURIComponent(district)}`, { params: coordinates }),
  mapOverlay: async () => api.get("/weather/map-overlay"),
};

// ============================================
// RADAR INTELLIGENCE SERVICE
// ============================================
export const radarService = {
  tiles: async () => api.get("/radar/tiles"),
  latest: async () => api.get("/radar/latest"),
  forecast: async () => api.get("/radar/forecast"),
  overlay: async () => api.get("/radar/overlay"),
  severity: async (district = "Mumbai") => api.get("/radar/severity", { params: { district } }),
  floodRisk: async (district?: string) => api.get("/radar/flood-risk", { params: district ? { district } : undefined }),
  stormTracking: async () => api.get("/radar/storm-tracking"),
  district: async (district: string) => api.get(`/radar/district/${encodeURIComponent(district)}`),
};
