/** Categorías de rubro. "ofertas" es un pseudo-filtro (no un rubro real de negocio). */
export type Category =
  | "gastronomia"
  | "indumentaria"
  | "servicios"
  | "showrooms";

export type FilterCategory = Category | "ofertas";

/** Estilos de casita 3D elegibles al dar de alta un negocio. */
export type HouseStyle =
  | "clasica"
  | "moderna"
  | "local_comercial"
  | "showroom"
  | "esquina";

export interface Product {
  id: string;
  businessId: string;
  name: string;
  price: number;
  photoUrl?: string;
  isOffer: boolean;
  offerLabel?: string;
  /** Palabras clave para el buscador universal (ej. "torta", "cumpleaños"). */
  keywords: string[];
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: Category;
  houseStyle: HouseStyle;
  /** Override opcional del color de techo (si no, se usa el de la categoría). */
  roofColor?: string;
  lat: number;
  lng: number;
  address: string;
  neighborhood: string;
  /** Número en formato internacional sin "+" ni espacios, ej. "5493815551234". */
  whatsapp: string;
  instagram?: string;
  phone?: string;
  description: string;
  hasActiveOffer: boolean;
}

/** Vista enriquecida de un negocio con sus productos ya resueltos. */
export interface BusinessWithProducts extends Business {
  products: Product[];
}

/** Payload del formulario "Sumar mi negocio". */
export interface Lead {
  id: string;
  name: string;
  category: Category;
  houseStyle: HouseStyle;
  lat: number;
  lng: number;
  address: string;
  neighborhood: string;
  whatsapp: string;
  instagram?: string;
  phone?: string;
  description: string;
  createdAt: string;
}

/** Metadatos de una categoría para UI (label, color, emoji). */
export interface CategoryMeta {
  key: FilterCategory;
  label: string;
  color: string;
  emoji: string;
}
