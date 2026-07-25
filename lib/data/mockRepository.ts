import type { Business, BusinessWithProducts, Lead, Product } from "@/types";
import type { BusinessRepository } from "./repository";
import { MOCK_BUSINESSES } from "./mock/businesses";
import { MOCK_PRODUCTS } from "./mock/products";

const LEADS_KEY = "barriomap:leads";

function productsFor(businessId: string): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.businessId === businessId);
}

/** Implementación mock en memoria. Los leads se guardan en localStorage (cliente). */
export class MockRepository implements BusinessRepository {
  async getAll(): Promise<Business[]> {
    return MOCK_BUSINESSES;
  }

  async getProducts(): Promise<Product[]> {
    return MOCK_PRODUCTS;
  }

  async getWithProducts(): Promise<BusinessWithProducts[]> {
    return MOCK_BUSINESSES.map((b) => ({ ...b, products: productsFor(b.id) }));
  }

  async getBySlug(slug: string): Promise<BusinessWithProducts | null> {
    const business = MOCK_BUSINESSES.find((b) => b.slug === slug);
    if (!business) return null;
    return { ...business, products: productsFor(business.id) };
  }

  async getOffers(): Promise<{ business: Business; product: Product }[]> {
    const byId = new Map(MOCK_BUSINESSES.map((b) => [b.id, b]));
    return MOCK_PRODUCTS.filter((p) => p.isOffer)
      .map((product) => {
        const business = byId.get(product.businessId);
        return business ? { business, product } : null;
      })
      .filter((x): x is { business: Business; product: Product } => x !== null);
  }

  async addLead(lead: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    const full: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      try {
        const existing: Lead[] = JSON.parse(
          window.localStorage.getItem(LEADS_KEY) ?? "[]"
        );
        existing.push(full);
        window.localStorage.setItem(LEADS_KEY, JSON.stringify(existing));
      } catch {
        // ignorar errores de almacenamiento (modo privado, etc.)
      }
    }
    return full;
  }
}
