import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  products: Product[];
}

export function CatalogGallery({ products }: Props) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este negocio todavía no cargó su catálogo.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((p) => (
        <article
          key={p.id}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
        >
          <div className="relative aspect-[4/3] bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.photoUrl}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            {p.isOffer && (
              <Badge
                color="#f59e0b"
                className="absolute left-1.5 top-1.5 bg-accent/95 !text-accent-foreground shadow-sm"
                style={{ backgroundColor: "#f59e0b", color: "#1a1206" }}
              >
                🔥 {p.offerLabel ?? "Oferta"}
              </Badge>
            )}
          </div>
          <div className="p-2.5">
            <h4 className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</h4>
            <p className="mt-1 text-sm font-semibold text-primary">
              {formatPrice(p.price)}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
