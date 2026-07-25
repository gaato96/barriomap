"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const CENTER: [number, number] = [-65.2219, -26.8235];

interface Props {
  value: { lng: number; lat: number } | null;
  onChange: (loc: { lng: number; lat: number }) => void;
}

/** Mini-mapa para fijar la ubicación exacta del negocio (click o arrastre del pin). */
export function LocationPicker({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: value ? [value.lng, value.lat] : CENTER,
      zoom: 15.5,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const marker = new maplibregl.Marker({ color: "#2563eb", draggable: true });
    markerRef.current = marker;
    if (value) marker.setLngLat([value.lng, value.lat]).addTo(map);

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      onChangeRef.current({ lng, lat });
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat).addTo(map);
      onChangeRef.current({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar el pin si el valor cambia desde afuera
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !value) return;
    marker.setLngLat([value.lng, value.lat]).addTo(map);
  }, [value]);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div ref={containerRef} className="h-56 w-full" />
    </div>
  );
}
