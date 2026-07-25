import { create } from "zustand";

interface UIState {
  offersMinimized: boolean;
  quickFiltersOpen: boolean;
  toggleOffersMinimized: () => void;
  setOffersMinimized: (v: boolean) => void;
  toggleQuickFilters: () => void;
  setQuickFiltersOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  offersMinimized: false,
  quickFiltersOpen: true,
  toggleOffersMinimized: () => set((s) => ({ offersMinimized: !s.offersMinimized })),
  setOffersMinimized: (offersMinimized) => set({ offersMinimized }),
  toggleQuickFilters: () => set((s) => ({ quickFiltersOpen: !s.quickFiltersOpen })),
  setQuickFiltersOpen: (quickFiltersOpen) => set({ quickFiltersOpen }),
}));
