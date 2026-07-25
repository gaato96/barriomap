import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente ADMIN con service_role. ⚠️ SOLO SERVIDOR. Ignora RLS.
 * Úsalo únicamente en Server Actions/Route Handlers del panel superadmin
 * (crear negocios + cuentas de dueños).
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
