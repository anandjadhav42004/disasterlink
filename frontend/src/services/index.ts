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

  verifyOtp: async (data: { userId?: string; otp?: string }) =>
    api.post("/auth/verify-otp", data),

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
  getAnalytics: async () => api.get("/admin/analytics"),

  getIncidents: async () => api.get("/admin/incidents"),

  getVolunteers: async () => api.get("/admin/volunteers"),

  broadcast: async (data: Record<string, unknown>) =>
    api.post("/admin/broadcast", data),

  getHeatmap: async () => api.get("/admin/heatmap"),
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
