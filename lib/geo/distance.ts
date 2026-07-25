/** Utilidades geográficas: distancia haversine y conversión a cuadras. */

const EARTH_RADIUS_M = 6371000;
/** Una cuadra tucumana ~ 100 metros. */
const METERS_PER_BLOCK = 100;

export interface LngLat {
  lng: number;
  lat: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distancia en metros entre dos coordenadas (haversine). */
export function distanceMeters(a: LngLat, b: LngLat): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Distancia en cuadras (redondeada, mínimo 1 si hay separación). */
export function distanceBlocks(a: LngLat, b: LngLat): number {
  const meters = distanceMeters(a, b);
  const blocks = Math.round(meters / METERS_PER_BLOCK);
  return meters > 20 ? Math.max(1, blocks) : 0;
}

/** Texto legible de distancia en cuadras (ej. "a 2 cuadras", "acá nomás"). */
export function formatBlocks(blocks: number): string {
  if (blocks <= 0) return "acá nomás";
  if (blocks === 1) return "a 1 cuadra";
  return `a ${blocks} cuadras`;
}

/** Bounding box [ [minLng,minLat], [maxLng,maxLat] ] a partir de un set de coords. */
export function boundsFrom(points: LngLat[]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const p of points) {
    minLng = Math.min(minLng, p.lng);
    minLat = Math.min(minLat, p.lat);
    maxLng = Math.max(maxLng, p.lng);
    maxLat = Math.max(maxLat, p.lat);
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
