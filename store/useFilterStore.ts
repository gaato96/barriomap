import { create } from "zustand";
import type { FilterCategory } from "@/types";

interface FilterState {
  query: string;
  categories: FilterCategory[];
  onlyOffers: boolean;
  setQuery: (q: string) => void;
  toggleCategory: (c: FilterCategory) => void;
  setOnlyOffers: (v: boolean) => void;
  clear: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  query: "",
  categories: [],
  onlyOffers: false,
  setQuery: (query) => set({ query }),
  toggleCategory: (c) =>
    set((s) => ({
      categories: s.categories.includes(c)
        ? s.categories.filter((x) => x !== c)
        : [...s.categories, c],
    })),
  setOnlyOffers: (onlyOffers) => set({ onlyOffers }),
  clear: () => set({ query: "", categories: [], onlyOffers: false }),
}));
