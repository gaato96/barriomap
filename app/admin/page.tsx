import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { StatusButtons } from "@/components/admin/StatusButtons";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, slug, name, category, status, neighborhood, owner_id, created_at, products(id)")
    .order("created_at", { ascending: false });

  const ownerIds = Array.from(
    new Set((businesses ?? []).map((b) => b.owner_id).filter((x): x is string => !!x))
  );
  let ownersMap = new Map<string, string | null>();
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ownerIds);
    ownersMap = new Map((owners ?? []).map((o) => [o.id, o.full_name]));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Negocios</h1>
          <p className="text-sm text-muted-foreground">
            {businesses?.length ?? 0} negocios registrados
          </p>
        </div>
        <Link
          href="/admin/negocios/nuevo"
          className={cn(buttonVariants({ variant: "accent" }))}
        >
          <Plus className="h-4 w-4" />
          Nuevo negocio
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Negocio</th>
              <th className="px-4 py-2.5 font-medium">Rubro</th>
              <th className="px-4 py-2.5 font-medium">Dueño</th>
              <th className="px-4 py-2.5 font-medium">Productos</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(businesses ?? []).map((b) => {
              const cat = CATEGORIES[b.category as keyof typeof CATEGORIES];
              return (
                <tr key={b.id}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.neighborhood}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge color={cat?.color}>
                      {cat?.emoji} {cat?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {b.owner_id ? ownersMap.get(b.owner_id) ?? "—" : "Sin asignar"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {(b.products as unknown[])?.length ?? 0}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusButtons
                      businessId={b.id}
                      status={b.status as "published" | "hidden" | "pending"}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/negocio/${b.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver ficha
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(businesses ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Todavía no hay negocios cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
