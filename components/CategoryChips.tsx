"use client";

import { useFilterStore } from "@/store/useFilterStore";
import { CATEGORIES, FILTER_ORDER } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/** Chips de categoría que alternan el filtro en el store compartido. */
export function CategoryChips({ className }: Props) {
  const categories = useFilterStore((s) => s.categories);
  const toggleCategory = useFilterStore((s) => s.toggleCategory);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {FILTER_ORDER.map((key) => {
        const meta = CATEGORIES[key];
        const active = categories.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggleCategory(key)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-all",
              active
                ? "border-transparent text-white"
                : "border-border bg-card text-foreground hover:bg-secondary"
            )}
            style={active ? { backgroundColor: meta.color } : undefined}
          >
            <span>{meta.emoji}</span>
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
