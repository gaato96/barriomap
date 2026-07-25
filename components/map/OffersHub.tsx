"use client";

import { Flame, ChevronDown, ChevronUp } from "lucide-react";
import type { Business, Product } from "@/types";
import { useUIStore } from "@/store/useUIStore";
import { useMapStore } from "@/store/useMapStore";
import { formatPrice } from "@/lib/utils";

interface Props {
  offers: { business: Business; product: Product }[];
}

export function OffersHub({ offers }: Props) {
  const minimized = useUIStore((s) => s.offersMinimized);
  const toggle = useUIStore((s) => s.toggleOffersMinimized);
  const setSelected = useMapStore((s) => s.setSelected);

  if (offers.length === 0) return null;

  return (
    <div className="pointer-events-auto w-[min(20rem,calc(100vw-2rem))]">
      {minimized ? (
        <button
          onClick={toggle}
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:scale-[1.02]"
        >
          <Flame className="h-4 w-4" />
          Ofertas ({offers.length})
          <ChevronUp className="h-4 w-4" />
        </button>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
          <div className="flex items-center justify-between bg-accent px-4 py-2.5 text-accent-foreground">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4" />
              Ofertas cercanas ({offers.length})
            </span>
            <button onClick={toggle} aria-label="Minimizar ofertas">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-64 divide-y divide-border overflow-y-auto scroll-slim">
            {offers.map(({ business, product }) => (
              <li key={product.id}>
                <button
                  onClick={() => setSelected(business.id)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.photoUrl}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {business.name}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </p>
                    {product.offerLabel && (
                      <p className="text-[10px] font-medium text-accent-foreground/70">
                        {product.offerLabel}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
