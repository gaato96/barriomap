import type { Business, BusinessWithProducts, Lead, Product } from "@/types";

/**
 * Contrato de acceso a datos. La UI depende SOLO de esta interfaz.
 * En Fase 2, una implementación SupabaseRepository reemplaza a MockRepository
 * sin tocar los componentes.
 */
export interface BusinessRepository {
  getAll(): Promise<Business[]>;
  getProducts(): Promise<Product[]>;
  getBySlug(slug: string): Promise<BusinessWithProducts | null>;
  getWithProducts(): Promise<BusinessWithProducts[]>;
  /** Negocios que tienen al menos un producto/servicio en oferta. */
  getOffers(): Promise<{ business: Business; product: Product }[]>;
  /** Registra un lead del formulario "Sumar mi negocio" (Fase 1: local). */
  addLead(lead: Omit<Lead, "id" | "createdAt">): Promise<Lead>;
}
