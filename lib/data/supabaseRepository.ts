import type { Business, BusinessWithProducts, Lead, Product } from "@/types";
import type { BusinessRepository } from "./repository";
import { getPublicClient } from "@/lib/supabase/public";

function mapProduct(row: any): Product {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    price: Number(row.price),
    photoUrl: row.photo_url ?? undefined,
    isOffer: row.is_offer,
    offerLabel: row.offer_label ?? undefined,
    keywords: row.keywords ?? [],
  };
}

function mapBusiness(row: any, hasActiveOffer: boolean): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    houseStyle: row.house_style,
    lat: row.lat,
    lng: row.lng,
    address: row.address ?? "",
    neighborhood: row.neighborhood ?? "",
    whatsapp: row.whatsapp,
    instagram: row.instagram ?? undefined,
    phone: row.phone ?? undefined,
    description: row.description ?? "",
    hasActiveOffer,
  };
}

/** Implementación de acceso a datos contra Supabase (lectura pública + leads). */
export class SupabaseRepository implements BusinessRepository {
  private get sb() {
    return getPublicClient();
  }

  async getWithProducts(): Promise<BusinessWithProducts[]> {
    const { data, error } = await this.sb
      .from("businesses")
      .select("*, products(*)")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []).map((row: any) => {
      const products = (row.products ?? []).map(mapProduct);
      return {
        ...mapBusiness(row, products.some((p: Product) => p.isOffer)),
        products,
      };
    });
  }

  async getAll(): Promise<Business[]> {
    const { data, error } = await this.sb
      .from("businesses")
      .select("*, products(is_offer)")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []).map((row: any) =>
      mapBusiness(row, (row.products ?? []).some((p: any) => p.is_offer))
    );
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.sb.from("products").select("*");
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  }

  async getBySlug(slug: string): Promise<BusinessWithProducts | null> {
    const { data, error } = await this.sb
      .from("businesses")
      .select("*, products(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const products = ((data as any).products ?? []).map(mapProduct);
    return {
      ...mapBusiness(data, products.some((p: Product) => p.isOffer)),
      products,
    };
  }

  async getOffers(): Promise<{ business: Business; product: Product }[]> {
    const { data, error } = await this.sb
      .from("products")
      .select("*, businesses!inner(*)")
      .eq("is_offer", true)
      .eq("businesses.status", "published");
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      product: mapProduct(row),
      business: mapBusiness(row.businesses, true),
    }));
  }

  async addLead(lead: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    const { data, error } = await this.sb
      .from("leads")
      .insert({
        name: lead.name,
        category: lead.category,
        house_style: lead.houseStyle,
        lat: lead.lat,
        lng: lead.lng,
        address: lead.address,
        neighborhood: lead.neighborhood,
        whatsapp: lead.whatsapp,
        instagram: lead.instagram,
        phone: lead.phone,
        description: lead.description,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      houseStyle: data.house_style,
      lat: data.lat,
      lng: data.lng,
      address: data.address ?? "",
      neighborhood: data.neighborhood ?? "",
      whatsapp: data.whatsapp,
      instagram: data.instagram ?? undefined,
      phone: data.phone ?? undefined,
      description: data.description ?? "",
      createdAt: data.created_at,
    };
  }
}
