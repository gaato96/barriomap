import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserRole = "superadmin" | "owner";

export interface CurrentUser {
  id: string;
  email: string | null;
  role: UserRole;
  fullName: string | null;
  /** Solo si role === "owner": el id del negocio que le pertenece (si ya tiene uno asignado). */
  businessId: string | null;
}

/**
 * Usuario autenticado + su perfil/rol. Null si no hay sesión o no tiene perfil.
 *
 * Usa `getSession()` (lectura local de la cookie, sin red) en vez de `getUser()`:
 * el middleware ya hizo la validación/refresh autoritativa contra Supabase para
 * este request. Llamar a `getUser()` de nuevo aquí (y otra vez dentro de cada
 * Server Action) dispara refrescos de token redundantes.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return null;
  }

  let businessId: string | null = null;
  if (profile.role === "owner") {
    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    businessId = biz?.id ?? null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role,
    fullName: profile.full_name,
    businessId,
  };
}

/** Devuelve el usuario si es dueño con negocio asignado; lanza si no. Uso en Server Actions. */
export async function requireOwnerBusiness(): Promise<{ userId: string; businessId: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner" || !user.businessId) {
    throw new Error("No autorizado.");
  }
  return { userId: user.id, businessId: user.businessId };
}
