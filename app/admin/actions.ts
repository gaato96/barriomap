"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import type { Category, HouseStyle } from "@/types";

async function requireSuperadmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "superadmin") {
    throw new Error("No autorizado.");
  }
  return user;
}

async function uniqueSlug(base: string): Promise<string> {
  const admin = createSupabaseAdminClient();
  const slug = slugify(base);
  const { data } = await admin.from("businesses").select("slug").like("slug", `${slug}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(slug)) return slug;
  let i = 2;
  while (taken.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export interface CreateBusinessInput {
  name: string;
  category: Category;
  houseStyle: HouseStyle;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  whatsapp: string;
  instagram?: string;
  phone?: string;
  description: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerName: string;
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createBusinessWithOwner(
  input: CreateBusinessInput
): Promise<ActionResult<{ businessId: string; slug: string }>> {
  await requireSuperadmin();
  const admin = createSupabaseAdminClient();

  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email: input.ownerEmail,
    password: input.ownerPassword,
    email_confirm: true,
  });
  if (userErr || !created.user) {
    return { ok: false, error: userErr?.message ?? "No se pudo crear la cuenta del dueño." };
  }
  const ownerId = created.user.id;

  try {
    const { error: profileErr } = await admin
      .from("profiles")
      .insert({ id: ownerId, role: "owner", full_name: input.ownerName });
    if (profileErr) throw profileErr;

    const slug = await uniqueSlug(input.name);
    const { data: biz, error: bizErr } = await admin
      .from("businesses")
      .insert({
        slug,
        name: input.name,
        category: input.category,
        house_style: input.houseStyle,
        lat: input.lat,
        lng: input.lng,
        address: input.address,
        neighborhood: input.neighborhood,
        whatsapp: input.whatsapp,
        instagram: input.instagram || null,
        phone: input.phone || null,
        description: input.description,
        status: "published",
        owner_id: ownerId,
      })
      .select("id, slug")
      .single();
    if (bizErr) throw bizErr;

    revalidatePath("/admin");
    return { ok: true, data: { businessId: biz.id, slug: biz.slug } };
  } catch (e) {
    // Rollback: si algo falló después de crear el usuario, no dejar cuentas huérfanas.
    await admin.auth.admin.deleteUser(ownerId);
    const message = e instanceof Error ? e.message : "Error creando el negocio.";
    return { ok: false, error: message };
  }
}

export async function setBusinessStatus(
  businessId: string,
  status: "published" | "hidden" | "pending"
): Promise<ActionResult> {
  await requireSuperadmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("businesses").update({ status }).eq("id", businessId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

export async function markLeadReviewed(leadId: string): Promise<ActionResult> {
  await requireSuperadmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("leads").update({ status: "reviewed" }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true, data: undefined };
}
