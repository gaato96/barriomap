import type { Business, FilterCategory, Product } from "@/types";
import { normalize } from "@/lib/utils";

export interface SearchInput {
  query: string;
  categories: FilterCategory[]; // categorías activas ([] = todas)
  onlyOffers: boolean;
  businesses: Business[];
  products: Product[];
}

export interface SearchResult {
  /** Ids de negocios que coinciden con la búsqueda + filtros. */
  matchedIds: Set<string>;
  /** True si hay algún criterio activo (texto/categoría/ofertas). */
  isFiltering: boolean;
}

/**
 * Matching del buscador universal: nombre de negocio + nombre de producto + keywords,
 * intersectado con los filtros de categoría y "solo ofertas".
 */
export function searchBusinesses({
  query,
  categories,
  onlyOffers,
  businesses,
  products,
}: SearchInput): SearchResult {
  const q = normalize(query.trim());
  const hasQuery = q.length > 0;
  const hasCategories = categories.length > 0;
  const isFiltering = hasQuery || hasCategories || onlyOffers;

  const productsByBusiness = new Map<string, Product[]>();
  for (const p of products) {
    const list = productsByBusiness.get(p.businessId) ?? [];
    list.push(p);
    productsByBusiness.set(p.businessId, list);
  }

  const matchedIds = new Set<string>();

  for (const b of businesses) {
    // Filtro por categoría (la pseudo-categoría "ofertas" se maneja aparte)
    const realCategories = categories.filter((c) => c !== "ofertas");
    if (realCategories.length > 0 && !realCategories.includes(b.category)) {
      continue;
    }

    const wantsOffers = onlyOffers || categories.includes("ofertas");
    if (wantsOffers && !b.hasActiveOffer) {
      continue;
    }

    // Filtro por texto
    if (hasQuery) {
      const inName = normalize(b.name).includes(q);
      const inDesc = normalize(b.description).includes(q);
      const bizProducts = productsByBusiness.get(b.id) ?? [];
      const inProducts = bizProducts.some(
        (p) =>
          normalize(p.name).includes(q) ||
          p.keywords.some((k) => normalize(k).includes(q))
      );
      if (!inName && !inDesc && !inProducts) continue;
    }

    matchedIds.add(b.id);
  }

  return { matchedIds, isFiltering };
}
