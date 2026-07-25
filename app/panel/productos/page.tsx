import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOwnerBusiness } from "@/lib/auth/session";
import type { Product } from "@/types";
import { ProductManager } from "@/components/panel/ProductManager";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const { businessId } = await requireOwnerBusiness();
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .single();

  const { data: rows } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  const products: Product[] = (rows ?? []).map((r) => ({
    id: r.id,
    businessId: r.business_id,
    name: r.name,
    price: Number(r.price),
    photoUrl: r.photo_url ?? undefined,
    isOffer: r.is_offer,
    offerLabel: r.offer_label ?? undefined,
    keywords: r.keywords ?? [],
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">Productos y ofertas</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {business?.name} · {products.length} producto{products.length === 1 ? "" : "s"}
      </p>
      <ProductManager businessId={businessId} products={products} />
    </div>
  );
}
