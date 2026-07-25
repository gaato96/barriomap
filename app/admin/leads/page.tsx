import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeadRow } from "@/components/admin/LeadRow";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-bold">Leads de &quot;Sumar mi negocio&quot;</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {leads?.length ?? 0} solicitudes recibidas desde el formulario público.
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {(leads ?? []).length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Todavía no hay leads.</p>
        ) : (
          (leads ?? []).map((lead) => <LeadRow key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
