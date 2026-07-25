import { createSupabaseBrowserClient } from "./client";

/** Sube una foto de producto al bucket público, dentro de la carpeta del negocio. */
export async function uploadProductPhoto(businessId: string, file: File): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${businessId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-photos").getPublicUrl(path);
  return publicUrl;
}
