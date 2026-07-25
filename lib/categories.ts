import type { Category, FilterCategory, CategoryMeta, HouseStyle } from "@/types";

/** Metadatos de categorías para chips, techos y badges. */
export const CATEGORIES: Record<FilterCategory, CategoryMeta> = {
  gastronomia: { key: "gastronomia", label: "Gastronomía", color: "#ef4444", emoji: "🍽️" },
  indumentaria: { key: "indumentaria", label: "Indumentaria", color: "#a855f7", emoji: "👕" },
  servicios: { key: "servicios", label: "Servicios", color: "#3b82f6", emoji: "🔧" },
  showrooms: { key: "showrooms", label: "Showrooms", color: "#22c55e", emoji: "🛋️" },
  ofertas: { key: "ofertas", label: "Ofertas", color: "#f59e0b", emoji: "🔥" },
};

/** Orden de los chips de filtro en la UI. */
export const FILTER_ORDER: FilterCategory[] = [
  "gastronomia",
  "indumentaria",
  "servicios",
  "showrooms",
  "ofertas",
];

/** Color de techo según categoría del negocio. */
export function roofColorForCategory(category: Category): string {
  return CATEGORIES[category].color;
}

/** Estilos de casita disponibles, con etiqueta legible para el formulario. */
export const HOUSE_STYLES: { value: HouseStyle; label: string }[] = [
  { value: "clasica", label: "Casa clásica (techo a dos aguas)" },
  { value: "moderna", label: "Casa moderna (techo plano)" },
  { value: "local_comercial", label: "Local comercial (vidriera)" },
  { value: "showroom", label: "Showroom (amplio)" },
  { value: "esquina", label: "Local de esquina" },
];
