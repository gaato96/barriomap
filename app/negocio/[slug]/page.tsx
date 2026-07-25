import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { repository } from "@/lib/data";
import { CATEGORIES } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { ConversionButtons } from "@/components/business/ConversionButtons";
import { CatalogGallery } from "@/components/business/CatalogGallery";

export async function generateStaticParams() {
  const businesses = await repository.getAll();
  return businesses.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await repository.getBySlug(slug);
  return { title: business ? `${business.name} | BarrioMap` : "Negocio | BarrioMap" };
}

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await repository.getBySlug(slug);
  if (!business) notFound();

  const cat = CATEGORIES[business.category];

  return (
    <div className="h-full overflow-y-auto scroll-slim">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al mapa
        </Link>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge color={cat.color}>
              {cat.emoji} {cat.label}
            </Badge>
            {business.hasActiveOffer && (
              <Badge style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                🔥 Oferta activa
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {business.address} · {business.neighborhood}, San Miguel de Tucumán
          </p>

          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
            {business.description}
          </p>

          <ConversionButtons business={business} className="mt-5" />
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Catálogo & ofertas</h2>
          <CatalogGallery products={business.products} />
        </div>
      </div>
    </div>
  );
}
