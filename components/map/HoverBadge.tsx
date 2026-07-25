import type { Business } from "@/types";
import type { LngLat } from "@/lib/geo/distance";
import { CATEGORIES } from "@/lib/categories";
import { distanceBlocks, formatBlocks } from "@/lib/geo/distance";
import { Badge } from "@/components/ui/badge";

interface Props {
  business: Business;
  x: number;
  y: number;
  userLocation: LngLat | null;
}

/** Badge flotante que sigue a la casita en hover. Posicionado por el padre. */
export function HoverBadge({ business, x, y, userLocation }: Props) {
  const cat = CATEGORIES[business.category];
  const blocks = userLocation ? distanceBlocks(userLocation, business) : null;

  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full animate-fade-in"
      style={{ left: x, top: y - 74 }}
    >
      <div className="min-w-[9rem] max-w-[15rem] rounded-xl bg-card px-3 py-2 shadow-soft">
        <div className="mb-1 flex items-center gap-1.5">
          <Badge color={cat.color} className="text-[10px]">
            {cat.emoji} {cat.label}
          </Badge>
          {business.hasActiveOffer && (
            <Badge
              className="text-[10px]"
              style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
            >
              🔥 Oferta
            </Badge>
          )}
        </div>
        <p className="truncate text-sm font-semibold leading-tight">{business.name}</p>
        {blocks != null && (
          <p className="text-xs font-medium text-primary">{formatBlocks(blocks)}</p>
        )}
      </div>
      {/* Puntita del globo */}
      <div className="mx-auto h-2.5 w-2.5 -translate-y-1 rotate-45 bg-card shadow-soft" />
    </div>
  );
}
