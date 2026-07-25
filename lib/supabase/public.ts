import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo para LECTURA PÚBLICA (mapa/directorio). No maneja sesión:
 * funciona igual en servidor y cliente. Los permisos los aplica RLS.
 */
let cached: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  cached = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** True si hay credenciales de Supabase configuradas. */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
