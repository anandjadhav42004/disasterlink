import { create } from "zustand";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; role: UserRole }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const mockUser: User = {
  id: "USR-001",
  name: "Commander Alexandra Reyes",
  email: "a.reyes@disasterlink.gov",
  role: "admin",
  phone: "(202) 555-0100",
  isVerified: true,
  createdAt: "2024-01-15T00:00:00Z",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1000));
    set({
      user: { ...mockUser, email },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (data) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1500));
    set({
      user: {
        ...mockUser,
        name: data.name,
        email: data.email,
        role: data.role,
      },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
