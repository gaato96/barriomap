import { MockRepository } from "./mockRepository";
import { SupabaseRepository } from "./supabaseRepository";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import type { BusinessRepository } from "./repository";

/**
 * Instancia activa del repositorio de datos.
 * - Con credenciales de Supabase configuradas -> SupabaseRepository (Fase 2).
 * - Sin credenciales -> MockRepository (Fase 1, datos de ejemplo).
 */
export const repository: BusinessRepository = isSupabaseConfigured
  ? new SupabaseRepository()
  : new MockRepository();

export type { BusinessRepository } from "./repository";
