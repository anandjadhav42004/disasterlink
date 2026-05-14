import { create } from "zustand";
import type { UserRole } from "@/types";
import type { Permission } from "@/lib/permissions";
import { getPermissionsForRole, ROLE_REDIRECT } from "@/lib/permissions";
import { authService } from "@/services";

// Mirror what the backend returns
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  latitude: number | null;
  longitude: number | null;
  isVerified?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string; error?: string }>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  hydrate: () => void;
  clearError: () => void;
  hasPermission: (permission: Permission) => boolean;
}

// ── helpers ──────────────────────────────────────────────
const isBrowser = typeof window !== "undefined";

function getStoredToken() {
  return isBrowser ? localStorage.getItem("dl_token") : null;
}

function setTokens(access: string, refresh: string) {
  if (!isBrowser) return;
  localStorage.setItem("dl_token", access);
  localStorage.setItem("dl_refresh_token", refresh);
}

function clearTokens() {
  if (!isBrowser) return;
  localStorage.removeItem("dl_token");
  localStorage.removeItem("dl_refresh_token");
}

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? fallback;
  }
  return fallback;
}
// ─────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  permissions: [],
  isAuthenticated: !!getStoredToken(),
  isLoading: false,
  isHydrated: false,
  error: null,

  clearError: () => set({ error: null }),

  // ── Login ────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.login({ email, password });
      const { user, accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);
      
      const role = user.role as UserRole;
      const permissions = getPermissionsForRole(role);

      set({
        user,
        role,
        permissions,
        isAuthenticated: true,
        isLoading: false,
      });

      return {
        success: true,
        redirectTo: ROLE_REDIRECT[role],
      };
    } catch (err) {
      const message = extractMessage(err, "Login failed. Please check your credentials.");
      set({ isLoading: false, error: message, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  // ── Register ─────────────────────────────────────────
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.register(payload);
      const { user, accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);
      
      const role = user.role as UserRole;
      const permissions = getPermissionsForRole(role);

      set({
        user,
        role,
        permissions,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const message = extractMessage(err, "Registration failed. Please try again.");
      set({ isLoading: false, error: message, isAuthenticated: false });
      throw err;
    }
  },

  // ── Logout ───────────────────────────────────────────
  logout: async () => {
    const refreshToken = isBrowser ? localStorage.getItem("dl_refresh_token") : null;
    try {
      if (refreshToken) await authService.logout({ refreshToken });
    } catch {
      // ignore server errors — always clear client state
    } finally {
      clearTokens();
      set({ user: null, role: null, permissions: [], isAuthenticated: false });
    }
  },

  // ── Hydrate from token on app load ───────────────────
  fetchMe: async () => {
    if (!getStoredToken()) return;
    set({ isLoading: true });
    try {
      const { data } = await authService.me();
      const user = data.data;
      const role = user.role as UserRole;
      set({
        user,
        role,
        permissions: getPermissionsForRole(role),
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      clearTokens();
      set({ user: null, role: null, permissions: [], isAuthenticated: false, isLoading: false });
    }
  },

  hydrate: () => {
    // Basic hydration check - fetchMe handles the actual data restoration
    if (getStoredToken()) {
      get().fetchMe();
    }
    set({ isHydrated: true });
  },

  hasPermission: (permission: Permission) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },
}));
