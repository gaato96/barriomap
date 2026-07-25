import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import type { BusinessWithProducts } from "@/types";
import { CATEGORIES } from "@/lib/categories";
import { formatBlocks } from "@/lib/geo/distance";
import { Badge } from "@/components/ui/badge";
import { ConversionButtons } from "@/components/business/ConversionButtons";

interface Props {
  business: BusinessWithProducts;
  distanceBlocks?: number | null;
}

export function BusinessCard({ business, distanceBlocks }: Props) {
  const cat = CATEGORIES[business.category];
  const offerCount = business.products.filter((p) => p.isOffer).length;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge color={cat.color}>
              {cat.emoji} {cat.label}
            </Badge>
            {business.hasActiveOffer && (
              <Badge style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                🔥 Oferta{offerCount > 1 ? `s (${offerCount})` : ""}
              </Badge>
            )}
          </div>
          <h3 className="truncate text-base font-semibold">{business.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {business.address} · {business.neighborhood}
            </span>
          </p>
          {distanceBlocks != null && (
            <p className="mt-0.5 text-xs font-medium text-primary">
              {formatBlocks(distanceBlocks)}
            </p>
          )}
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>

      <div className="flex items-center justify-between gap-2">
        <ConversionButtons business={business} compact />
        <Link
          href={`/negocio/${business.slug}`}
          className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
        >
          Ver ficha
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
