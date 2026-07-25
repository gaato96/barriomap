"use client";

import { useCallback } from "react";
import { useMapStore } from "@/store/useMapStore";

/**
 * Solicita la ubicación del navegador y la guarda en el store.
 * Devuelve un disparador y el estado de carga.
 */
export function useGeolocate() {
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const setLocating = useMapStore((s) => s.setLocating);
  const locating = useMapStore((s) => s.locating);
  const userLocation = useMapStore((s) => s.userLocation);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Tu navegador no permite geolocalización.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("No pudimos obtener tu ubicación. Revisá los permisos del navegador.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [setLocating, setUserLocation]);

  return { locate, locating, userLocation };
}
