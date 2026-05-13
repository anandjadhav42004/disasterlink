import { create } from "zustand";

interface DashboardState {
  dateRange: string;
  activeTab: string;
  searchQuery: string;
  filterStatus: string;
  filterSeverity: string;
  setDateRange: (range: string) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterSeverity: (severity: string) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dateRange: "7d",
  activeTab: "overview",
  searchQuery: "",
  filterStatus: "all",
  filterSeverity: "all",

  setDateRange: (range) => set({ dateRange: range }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterSeverity: (severity) => set({ filterSeverity: severity }),
  resetFilters: () =>
    set({
      searchQuery: "",
      filterStatus: "all",
      filterSeverity: "all",
    }),
}));
