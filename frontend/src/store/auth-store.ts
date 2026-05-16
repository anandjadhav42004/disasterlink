import { create } from "zustand";
import type { UserAccess, UserRole } from "@/types";
import type { Permission } from "@/lib/permissions";
import { defaultRedirect, hasPermission } from "@/lib/permissions";
import { authService } from "@/services";

// Mirror what the backend returns
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  access: UserAccess;
  roles?: UserAccess["roles"];
  permissions?: string[];
  dashboards?: string[];
  modules?: string[];
  latitude: number | null;
  longitude: number | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  isVerified?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  permissions: Permission[];
  access: UserAccess | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo?: string; error?: string }>;
  agencySsoLogin: () => Promise<{ success: boolean; redirectTo?: string; error?: string }>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => Promise<{ success: boolean; redirectTo?: string; error?: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  hydrate: () => void;
  clearError: () => void;
  hasPermission: (permission: Permission) => boolean;
}

// ── helpers ──────────────────────────────────────────────
const isBrowser = typeof window !== "undefined";

function getStoredToken() {
  return isBrowser ? localStorage.getItem("disasterlink_session") || localStorage.getItem("dl_token") : null;
}

function setTokens(access: string, refresh: string) {
  if (!isBrowser) return;
  localStorage.setItem("dl_token", access);
  localStorage.setItem("dl_refresh_token", refresh);
  localStorage.setItem("disasterlink_session", access);
  localStorage.setItem("disasterlink_refresh", refresh);
}

function clearTokens() {
  if (!isBrowser) return;
  localStorage.removeItem("dl_token");
  localStorage.removeItem("dl_refresh_token");
  localStorage.removeItem("disasterlink_session");
  localStorage.removeItem("disasterlink_refresh");
  localStorage.removeItem("disasterlink_user");
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
  access: null,
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
      const { user, access, accessToken, refreshToken, redirectTo } = data.data;
      setTokens(accessToken, refreshToken);
      
      const role = user.role as UserRole;
      const permissions = access.permissions ?? [];

      set({
        user: { ...user, access, permissions, roles: access.roles, dashboards: access.dashboards, modules: access.modules },
        role,
        permissions,
        access,
        isAuthenticated: true,
        isLoading: false,
      });

      return {
        success: true,
        redirectTo: redirectTo ?? defaultRedirect(access),
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
      const { user, access, accessToken, refreshToken, redirectTo } = data.data;
      setTokens(accessToken, refreshToken);
      
      const role = user.role as UserRole;
      const permissions = access.permissions ?? [];

      set({
        user: { ...user, access, permissions, roles: access.roles, dashboards: access.dashboards, modules: access.modules },
        role,
        permissions,
        access,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, redirectTo: redirectTo ?? defaultRedirect(access) };
    } catch (err) {
      const message = extractMessage(err, "Registration failed. Please try again.");
      set({ isLoading: false, error: message, isAuthenticated: false });
      return { success: false, error: message };
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
      set({ user: null, role: null, permissions: [], access: null, isAuthenticated: false });
    }
  },

  // ── Hydrate from token on app load ───────────────────
  fetchMe: async () => {
    if (!getStoredToken()) {
      set({ user: null, role: null, permissions: [], access: null, isAuthenticated: false, isLoading: false, isHydrated: true });
      return;
    }
    set({ isLoading: true });
    try {
      const { data } = await authService.me();
      const { user, access } = data.data;
      const role = user.role as UserRole;
      set({
        user: { ...user, access, permissions: access.permissions, roles: access.roles, dashboards: access.dashboards, modules: access.modules },
        role,
        permissions: access.permissions ?? [],
        access,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });
    } catch {
      clearTokens();
      set({ user: null, role: null, permissions: [], access: null, isAuthenticated: false, isLoading: false, isHydrated: true });
    }
  },

  hydrate: () => {
    const state = get();
    if (state.isLoading) return;
    if (state.isHydrated && state.user && state.access) return;

    if (!getStoredToken()) {
      set({ user: null, role: null, permissions: [], access: null, isAuthenticated: false, isHydrated: true });
      return;
    }

    void get().fetchMe();
  },

  hasPermission: (permission: Permission) => {
    return hasPermission(get().access, permission);
  },

  agencySsoLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const redirectUri = isBrowser ? `${window.location.origin}/login` : undefined;
      const start = await authService.startSso({ provider: "mock", redirectUri });
      const authorizationUrl = start.data.data.authorizationUrl as string;
      const code = new URL(authorizationUrl).searchParams.get("code") ?? `mock-${Date.now()}`;
      const { data } = await authService.completeSso({ provider: "mock", code, redirectUri });
      const { user, access, accessToken, refreshToken, redirectTo } = data.data;
      setTokens(accessToken, refreshToken);
      const role = user.role as UserRole;
      const permissions = access.permissions ?? [];
      set({
        user: { ...user, access, permissions, roles: access.roles, dashboards: access.dashboards, modules: access.modules },
        role,
        permissions,
        access,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, redirectTo: redirectTo ?? defaultRedirect(access) };
    } catch (err) {
      const message = extractMessage(err, "Agency SSO login failed.");
      set({ isLoading: false, error: message, isAuthenticated: false });
      return { success: false, error: message };
    }
  },
}));
