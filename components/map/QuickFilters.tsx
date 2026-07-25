"use client";

import { SlidersHorizontal, ChevronUp } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useFilterStore } from "@/store/useFilterStore";
import { CategoryChips } from "@/components/CategoryChips";
import { cn } from "@/lib/utils";

export function QuickFilters() {
  const open = useUIStore((s) => s.quickFiltersOpen);
  const toggle = useUIStore((s) => s.toggleQuickFilters);
  const categories = useFilterStore((s) => s.categories);

  return (
    <div className="pointer-events-auto">
      <button
        onClick={toggle}
        className="mb-2 flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-medium shadow-soft transition-colors hover:bg-secondary"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {categories.length > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
            {categories.length}
          </span>
        )}
        <ChevronUp
          className={cn("h-4 w-4 transition-transform", open ? "" : "rotate-180")}
        />
      </button>

      {open && (
        <div className="animate-fade-in rounded-2xl bg-card/95 p-3 shadow-soft backdrop-blur">
          <CategoryChips />
        </div>
      )}
    </div>
  );
}
