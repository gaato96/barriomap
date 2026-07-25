import { create } from "zustand";
import type { LngLat } from "@/lib/geo/distance";

interface MapState {
  hoveredId: string | null;
  selectedId: string | null;
  userLocation: LngLat | null;
  /** Estado de la solicitud de geolocalización. */
  locating: boolean;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  setUserLocation: (loc: LngLat | null) => void;
  setLocating: (v: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  hoveredId: null,
  selectedId: null,
  userLocation: null,
  locating: false,
  setHovered: (hoveredId) => set({ hoveredId }),
  setSelected: (selectedId) => set({ selectedId }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setLocating: (locating) => set({ locating }),
}));
