/**
 * Seed de datos mock -> Supabase. Requiere las variables en `.env.local`
 * (incluida SUPABASE_SERVICE_ROLE_KEY). Correr con:
 *
 *   npm run seed
 *
 * Es idempotente: borra negocios/productos previos y reinserta.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { MOCK_BUSINESSES } from "../lib/data/mock/businesses";
import { MOCK_PRODUCTS } from "../lib/data/mock/products";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("🧹 Limpiando datos previos…");
  // Borrar productos y negocios (cascade cubre productos igual)
  await sb.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await sb.from("businesses").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log(`🏪 Insertando ${MOCK_BUSINESSES.length} negocios…`);
  const { data: inserted, error: bizErr } = await sb
    .from("businesses")
    .insert(
      MOCK_BUSINESSES.map((b) => ({
        slug: b.slug,
        name: b.name,
        category: b.category,
        house_style: b.houseStyle,
        lat: b.lat,
        lng: b.lng,
        address: b.address,
        neighborhood: b.neighborhood,
        whatsapp: b.whatsapp,
        instagram: b.instagram ?? null,
        phone: b.phone ?? null,
        description: b.description,
        status: "published",
      }))
    )
    .select("id, slug");
  if (bizErr) throw bizErr;

  // mock business id -> slug -> nuevo uuid
  const slugToNewId = new Map(inserted!.map((r) => [r.slug, r.id]));
  const mockIdToSlug = new Map(MOCK_BUSINESSES.map((b) => [b.id, b.slug]));

  console.log(`📦 Insertando ${MOCK_PRODUCTS.length} productos…`);
  const { error: prodErr } = await sb.from("products").insert(
    MOCK_PRODUCTS.map((p) => {
      const slug = mockIdToSlug.get(p.businessId)!;
      return {
        business_id: slugToNewId.get(slug)!,
        name: p.name,
        price: p.price,
        photo_url: p.photoUrl ?? null,
        is_offer: p.isOffer,
        offer_label: p.offerLabel ?? null,
        keywords: p.keywords,
      };
    })
  );
  if (prodErr) throw prodErr;

  console.log("✅ Seed completo.");
}

main().catch((e) => {
  console.error("❌ Error en el seed:", e);
  process.exit(1);
});
