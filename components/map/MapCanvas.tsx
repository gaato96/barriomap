"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BusinessWithProducts } from "@/types";
import { useFilterStore } from "@/store/useFilterStore";
import { useMapStore } from "@/store/useMapStore";
import { searchBusinesses } from "@/lib/search";
import { distanceMeters } from "@/lib/geo/distance";
import { ThreeHouseLayer, LOD_ZOOM } from "./ThreeHouseLayer";
import { HoverBadge } from "./HoverBadge";

interface BadgeState {
  business: BusinessWithProducts;
  x: number;
  y: number;
}

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
// Centro aproximado del barrio (San Miguel de Tucumán)
const CENTER: [number, number] = [-65.2219, -26.8235];

interface Props {
  businesses: BusinessWithProducts[];
}

export function MapCanvas({ businesses }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const layerRef = useRef<ThreeHouseLayer | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const readyRef = useRef(false);
  const [badge, setBadge] = useState<BadgeState | null>(null);

  const allProducts = businesses.flatMap((b) => b.products);

  // ---- Init del mapa (una sola vez) ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: CENTER,
      zoom: 16.1,
      pitch: 50,
      bearing: -18,
      antialias: true,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __barrioMap?: maplibregl.Map }).__barrioMap = map;
    }

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("load", () => {
      // Fuente con clustering para el LOD lejano
      map.addSource("biz", {
        type: "geojson",
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
        data: {
          type: "FeatureCollection",
          features: businesses.map((b) => ({
            type: "Feature",
            properties: { id: b.id, hasOffer: b.hasActiveOffer },
            geometry: { type: "Point", coordinates: [b.lng, b.lat] },
          })),
        },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "biz",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#3b82f6",
          "circle-opacity": 0.85,
          "circle-radius": ["step", ["get", "point_count"], 16, 5, 22, 10, 28],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "biz",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 13,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });
      map.addLayer({
        id: "unclustered",
        type: "circle",
        source: "biz",
        filter: ["!", ["has", "point_count"]],
        maxzoom: LOD_ZOOM,
        paint: {
          "circle-color": ["case", ["get", "hasOffer"], "#f59e0b", "#3b82f6"],
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Capa 3D de casitas
      const layer = new ThreeHouseLayer(businesses);
      layerRef.current = layer;
      map.addLayer(layer);

      readyRef.current = true;
      // Aplicar cualquier filtro que ya estuviera activo
      applyFilter();
    });

    // ---- Interacción ----
    const nearest = (x: number, y: number) => {
      if (map.getZoom() < LOD_ZOOM) return null;
      let best: BusinessWithProducts | null = null;
      let bestD = Infinity;
      for (const b of businesses) {
        const p = map.project([b.lng, b.lat]);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestD) {
          bestD = d;
          best = b;
        }
      }
      return bestD <= 46 ? best : null;
    };

    map.on("mousemove", (e) => {
      const b = nearest(e.point.x, e.point.y);
      useMapStore.getState().setHovered(b?.id ?? null);
      map.getCanvas().style.cursor = b ? "pointer" : "";
      if (b) {
        const p = map.project([b.lng, b.lat]);
        setBadge({ business: b, x: p.x, y: p.y });
      } else {
        setBadge(null);
      }
    });

    // Reposicionar el badge mientras se mueve/rota/zoomea el mapa
    map.on("move", () => {
      setBadge((prev) => {
        if (!prev) return null;
        const p = map.project([prev.business.lng, prev.business.lat]);
        return { ...prev, x: p.x, y: p.y };
      });
    });

    map.on("mouseout", () => setBadge(null));

    map.on("click", (e) => {
      // ¿Click en un clúster?
      const clusters = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (clusters.length > 0) {
        const clusterId = clusters[0].properties?.cluster_id;
        const src = map.getSource("biz") as maplibregl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({
            center: (clusters[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom + 0.4,
          });
        });
        return;
      }
      // ¿Click en una casita?
      const b = nearest(e.point.x, e.point.y);
      if (b) {
        useMapStore.getState().setSelected(b.id);
        map.flyTo({ center: [b.lng, b.lat], zoom: Math.max(map.getZoom(), 16.5), duration: 800 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Aplicar filtros de búsqueda: halo + cámara ----
  const applyFilter = () => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !readyRef.current) return;

    const { query, categories, onlyOffers } = useFilterStore.getState();
    const { matchedIds, isFiltering } = searchBusinesses({
      query,
      categories,
      onlyOffers,
      businesses,
      products: allProducts,
    });

    layer.setHighlight(isFiltering ? matchedIds : null);

    // Cámara: siempre volar al negocio coincidente MÁS CERCANO (a la ubicación del
    // usuario si la compartió; si no, al centro actual del mapa).
    if (isFiltering && matchedIds.size > 0) {
      const matched = businesses.filter((b) => matchedIds.has(b.id));
      const c = map.getCenter();
      const ref = useMapStore.getState().userLocation ?? { lng: c.lng, lat: c.lat };
      const nearestMatch = matched.reduce((best, b) =>
        distanceMeters(ref, b) < distanceMeters(ref, best) ? b : best
      );
      map.flyTo({
        center: [nearestMatch.lng, nearestMatch.lat],
        zoom: 16.8,
        duration: 900,
      });
    }
  };

  useEffect(() => {
    const unsub = useFilterStore.subscribe(() => applyFilter());
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Volar al negocio seleccionado (p.ej. desde otro control) ----
  const selectedId = useMapStore((s) => s.selectedId);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const b = businesses.find((x) => x.id === selectedId);
    if (b) map.flyTo({ center: [b.lng, b.lat], zoom: Math.max(map.getZoom(), 16.5), duration: 700 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // ---- Marcador de ubicación del usuario ----
  const userLocation = useMapStore((s) => s.userLocation);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }
    const el = document.createElement("div");
    el.style.cssText =
      "width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.25)";
    if (userMarkerRef.current) userMarkerRef.current.remove();
    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);
    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15.8, duration: 900 });
  }, [userLocation]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
      {badge && (
        <HoverBadge
          business={badge.business}
          x={badge.x}
          y={badge.y}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
