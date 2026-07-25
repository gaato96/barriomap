"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOwnerBusiness } from "@/lib/auth/session";
import type { ActionResult } from "@/app/admin/actions";

export interface ProductInput {
  name: string;
  price: number;
  photoUrl: string | null;
  isOffer: boolean;
  offerLabel: string | null;
  keywords: string[];
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const { businessId } = await requireOwnerBusiness();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").insert({
    business_id: businessId,
    name: input.name,
    price: input.price,
    photo_url: input.photoUrl,
    is_offer: input.isOffer,
    offer_label: input.offerLabel,
    keywords: input.keywords,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/panel/productos");
  return { ok: true, data: undefined };
}

export async function updateProduct(
  productId: string,
  input: ProductInput
): Promise<ActionResult> {
  const { businessId } = await requireOwnerBusiness();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      price: input.price,
      photo_url: input.photoUrl,
      is_offer: input.isOffer,
      offer_label: input.offerLabel,
      keywords: input.keywords,
    })
    .eq("id", productId)
    .eq("business_id", businessId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/panel/productos");
  return { ok: true, data: undefined };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const { businessId } = await requireOwnerBusiness();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("business_id", businessId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/panel/productos");
  return { ok: true, data: undefined };
}

export interface BusinessContactInput {
  address: string;
  neighborhood: string;
  whatsapp: string;
  instagram: string | null;
  phone: string | null;
  description: string;
}

export async function updateBusinessContact(input: BusinessContactInput): Promise<ActionResult> {
  const { businessId } = await requireOwnerBusiness();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      address: input.address,
      neighborhood: input.neighborhood,
      whatsapp: input.whatsapp,
      instagram: input.instagram,
      phone: input.phone,
      description: input.description,
    })
    .eq("id", businessId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/panel/negocio");
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
