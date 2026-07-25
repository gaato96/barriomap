"use client";

import Link from "next/link";
import { X, MapPin, ExternalLink } from "lucide-react";
import type { BusinessWithProducts } from "@/types";
import { useMapStore } from "@/store/useMapStore";
import { CATEGORIES } from "@/lib/categories";
import { distanceBlocks, formatBlocks } from "@/lib/geo/distance";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConversionButtons } from "./ConversionButtons";
import { CatalogGallery } from "./CatalogGallery";

interface Props {
  businesses: BusinessWithProducts[];
}

export function BusinessDrawer({ businesses }: Props) {
  const selectedId = useMapStore((s) => s.selectedId);
  const setSelected = useMapStore((s) => s.setSelected);
  const userLocation = useMapStore((s) => s.userLocation);

  const business = businesses.find((b) => b.id === selectedId) ?? null;
  const open = business !== null;

  const cat = business ? CATEGORIES[business.category] : null;
  const blocks =
    business && userLocation ? distanceBlocks(userLocation, business) : null;

  return (
    <>
      {/* Backdrop suave (no tapa del todo el mapa en desktop) */}
      <div
        onClick={() => setSelected(null)}
        className={cn(
          "pointer-events-none fixed inset-0 z-40 bg-slate-900/20 transition-opacity md:bg-transparent",
          open ? "pointer-events-auto opacity-100 md:pointer-events-none" : "opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed z-50 flex flex-col bg-card shadow-soft transition-transform duration-300",
          // Mobile: bottom sheet. Desktop: panel derecho.
          "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:w-[400px] md:max-h-none md:rounded-none md:border-l md:border-border",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
        )}
      >
        {business && cat && (
          <>
            <div className="flex items-start justify-between gap-2 border-b border-border p-4">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge color={cat.color}>
                    {cat.emoji} {cat.label}
                  </Badge>
                  {business.hasActiveOffer && (
                    <Badge style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                      🔥 Oferta activa
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg font-bold leading-tight">{business.name}</h2>
                <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {business.address} · {business.neighborhood}
                    {blocks != null && (
                      <span className="ml-1 font-medium text-primary">
                        · {formatBlocks(blocks)}
                      </span>
                    )}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scroll-slim p-4">
              <p className="mb-4 text-sm text-muted-foreground">{business.description}</p>

              <ConversionButtons business={business} className="mb-5" />

              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Catálogo & ofertas</h3>
                <span className="text-xs text-muted-foreground">
                  {business.products.length} ítems
                </span>
              </div>
              <CatalogGallery products={business.products} />
            </div>

            <div className="border-t border-border p-3">
              <Link
                href={`/negocio/${business.slug}`}
                className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-primary hover:underline"
              >
                Ver perfil completo
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
