"use client";

import { useMemo, useState } from "react";
import { Search, LocateFixed, Loader2, X } from "lucide-react";
import type { BusinessWithProducts } from "@/types";
import { useFilterStore } from "@/store/useFilterStore";
import { useGeolocate } from "@/lib/hooks/useGeolocate";
import { searchBusinesses } from "@/lib/search";
import { distanceBlocks as calcBlocks } from "@/lib/geo/distance";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CategoryChips } from "@/components/CategoryChips";
import { BusinessCard } from "./BusinessCard";

interface Props {
  businesses: BusinessWithProducts[];
  neighborhoods: string[];
}

export function DirectoryView({ businesses, neighborhoods }: Props) {
  const query = useFilterStore((s) => s.query);
  const setQuery = useFilterStore((s) => s.setQuery);
  const categories = useFilterStore((s) => s.categories);
  const onlyOffers = useFilterStore((s) => s.onlyOffers);
  const setOnlyOffers = useFilterStore((s) => s.setOnlyOffers);

  const { locate, locating, userLocation } = useGeolocate();

  // Filtro de barrio (local a esta vista).
  const [neighborhood, setNeighborhood] = useState<string>("todos");

  const allProducts = useMemo(
    () => businesses.flatMap((b) => b.products),
    [businesses]
  );

  const { matchedIds } = useMemo(
    () =>
      searchBusinesses({
        query,
        categories,
        onlyOffers,
        businesses,
        products: allProducts,
      }),
    [query, categories, onlyOffers, businesses, allProducts]
  );

  const results = useMemo(() => {
    let list = businesses.filter((b) => matchedIds.has(b.id));

    if (neighborhood !== "todos") {
      list = list.filter((b) => b.neighborhood === neighborhood);
    }

    if (userLocation) {
      list = [...list].sort((a, b) => {
        const da = calcBlocks(userLocation, a);
        const db = calcBlocks(userLocation, b);
        return da - db;
      });
    }
    return list;
  }, [businesses, matchedIds, userLocation, neighborhood]);

  return (
    <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto scroll-slim px-4 py-5">
      {/* Controles */}
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscá un negocio o producto (ej. torta, aire, regalo)…"
            className="h-11 pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <CategoryChips />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="h-9 rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filtrar por barrio"
          >
            <option value="todos">Todos los barrios</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={onlyOffers}
              onCheckedChange={setOnlyOffers}
              id="only-offers"
              aria-label="Solo con ofertas activas"
            />
            <label htmlFor="only-offers" className="cursor-pointer text-sm font-medium">
              🔥 Solo con ofertas activas
            </label>
          </div>

          <button
            onClick={locate}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-secondary",
              userLocation && "border-primary/40 text-primary"
            )}
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            {userLocation ? "Ordenado por cercanía" : "Ordenar por cercanía"}
          </button>
        </div>
      </div>

      {/* Resultados */}
      <p className="mb-3 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "comercio" : "comercios"}
        {userLocation ? " (más cercanos primero)" : ""}
      </p>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No encontramos comercios con esos filtros. Probá con otra palabra.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-2">
          {results.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              distanceBlocks={userLocation ? calcBlocks(userLocation, b) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
