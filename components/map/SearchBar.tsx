"use client";

import { Search, X } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const query = useFilterStore((s) => s.query);
  const setQuery = useFilterStore((s) => s.setQuery);

  return (
    <div className="pointer-events-auto w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá productos o negocios… (ej. empanadas, regalo)"
          className="h-11 rounded-xl pl-9 pr-9 shadow-soft"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
