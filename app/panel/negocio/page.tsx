import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOwnerBusiness } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { BusinessContactForm } from "@/components/panel/BusinessContactForm";

export const dynamic = "force-dynamic";

export default async function MiNegocioPage() {
  const { businessId } = await requireOwnerBusiness();
  const supabase = await createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, category, address, neighborhood, whatsapp, instagram, phone, description")
    .eq("id", businessId)
    .single();

  if (!business) return null;
  const cat = CATEGORIES[business.category as keyof typeof CATEGORIES];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-center gap-2">
        <h1 className="text-xl font-bold">{business.name}</h1>
        <Badge color={cat?.color}>
          {cat?.emoji} {cat?.label}
        </Badge>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Estos datos son los que ven tus clientes en el mapa y en tu ficha pública. El rubro y la
        ubicación los administra BarrioMap — escribinos si necesitás cambiarlos.
      </p>

      <BusinessContactForm
        initial={{
          address: business.address ?? "",
          neighborhood: business.neighborhood ?? "",
          whatsapp: business.whatsapp,
          instagram: business.instagram,
          phone: business.phone,
          description: business.description ?? "",
        }}
      />
    </div>
  );
}
