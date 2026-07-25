import type { Product } from "@/types";

/** Imagen placeholder determinística por id (sin dependencias externas de dataset). */
const img = (seed: string) => `https://picsum.photos/seed/barriomap-${seed}/400/300`;

export const MOCK_PRODUCTS: Product[] = [
  // La Esquina de las Empanadas
  {
    id: "p1",
    businessId: "b1",
    name: "Docena de empanadas tucumanas",
    price: 6000,
    photoUrl: img("empanadas"),
    isOffer: true,
    offerLabel: "2x1 los martes",
    keywords: ["empanadas", "docena", "carne", "pollo", "comida"],
  },
  {
    id: "p2",
    businessId: "b1",
    name: "Locro (porción)",
    price: 4500,
    photoUrl: img("locro"),
    isOffer: false,
    keywords: ["locro", "guiso", "comida", "regional"],
  },

  // Dulce Hogar
  {
    id: "p3",
    businessId: "b2",
    name: "Torta de cumpleaños personalizada",
    price: 18000,
    photoUrl: img("torta"),
    isOffer: true,
    offerLabel: "10% off por seña",
    keywords: ["torta", "cumpleaños", "cumpleanos", "postre", "regalo", "dulce"],
  },
  {
    id: "p4",
    businessId: "b2",
    name: "Mesa dulce para eventos",
    price: 35000,
    photoUrl: img("mesadulce"),
    isOffer: false,
    keywords: ["mesa dulce", "evento", "postres", "cumpleaños"],
  },

  // Nube Indumentaria
  {
    id: "p5",
    businessId: "b3",
    name: "Vestido de verano",
    price: 22000,
    photoUrl: img("vestido"),
    isOffer: false,
    keywords: ["vestido", "ropa", "mujer", "verano", "indumentaria"],
  },

  // Deco Casa Showroom
  {
    id: "p6",
    businessId: "b4",
    name: "Sillón de dos cuerpos",
    price: 180000,
    photoUrl: img("sillon"),
    isOffer: true,
    offerLabel: "Envío gratis",
    keywords: ["sillon", "sofa", "mueble", "living", "deco"],
  },
  {
    id: "p7",
    businessId: "b4",
    name: "Set de cuadros decorativos",
    price: 15000,
    photoUrl: img("cuadros"),
    isOffer: false,
    keywords: ["cuadros", "deco", "pared", "regalo"],
  },

  // ClimaTec Service
  {
    id: "p8",
    businessId: "b5",
    name: "Reparación de aire acondicionado",
    price: 12000,
    photoUrl: img("aire"),
    isOffer: false,
    keywords: ["aire acondicionado", "reparacion", "service", "split", "arreglo"],
  },
  {
    id: "p9",
    businessId: "b5",
    name: "Carga de gas de heladera",
    price: 20000,
    photoUrl: img("heladera"),
    isOffer: false,
    keywords: ["heladera", "gas", "reparacion", "service"],
  },

  // Kids
  {
    id: "p10",
    businessId: "b6",
    name: "Conjunto para bebé",
    price: 9000,
    photoUrl: img("bebe"),
    isOffer: true,
    offerLabel: "3x2 en body",
    keywords: ["bebe", "ropa", "niños", "regalo", "baby shower"],
  },

  // Pizzería Don Luigi
  {
    id: "p11",
    businessId: "b7",
    name: "Pizza grande muzzarella",
    price: 8500,
    photoUrl: img("pizza"),
    isOffer: false,
    keywords: ["pizza", "muzzarella", "comida", "delivery"],
  },

  // Glow Cosmética
  {
    id: "p12",
    businessId: "b8",
    name: "Set de skincare facial",
    price: 28000,
    photoUrl: img("skincare"),
    isOffer: true,
    offerLabel: "15% off",
    keywords: ["skincare", "cosmetica", "facial", "belleza", "regalo"],
  },
  {
    id: "p13",
    businessId: "b8",
    name: "Perfume importado",
    price: 45000,
    photoUrl: img("perfume"),
    isOffer: false,
    keywords: ["perfume", "fragancia", "regalo", "belleza"],
  },

  // Electro Service José
  {
    id: "p14",
    businessId: "b9",
    name: "Reparación de lavarropas",
    price: 15000,
    photoUrl: img("lavarropas"),
    isOffer: false,
    keywords: ["lavarropas", "reparacion", "electrodomestico", "service"],
  },

  // Sabores Café
  {
    id: "p15",
    businessId: "b10",
    name: "Brunch para dos",
    price: 16000,
    photoUrl: img("brunch"),
    isOffer: true,
    offerLabel: "Incluye café",
    keywords: ["brunch", "cafe", "merienda", "desayuno", "comida"],
  },

  // Urban Sneakers
  {
    id: "p16",
    businessId: "b11",
    name: "Zapatillas urbanas",
    price: 65000,
    photoUrl: img("zapatillas"),
    isOffer: false,
    keywords: ["zapatillas", "sneakers", "calzado", "ropa", "deportivas"],
  },

  // Flores y Regalos Lucía
  {
    id: "p17",
    businessId: "b12",
    name: "Ramo de flores frescas",
    price: 12000,
    photoUrl: img("flores"),
    isOffer: true,
    offerLabel: "Envío sin cargo",
    keywords: ["flores", "ramo", "regalo", "plantas", "cumpleaños"],
  },

  // Plomería El Tano
  {
    id: "p18",
    businessId: "b13",
    name: "Destapación de cañerías",
    price: 18000,
    photoUrl: img("plomeria"),
    isOffer: false,
    keywords: ["plomeria", "destapacion", "caños", "gasista", "arreglo"],
  },

  // Burger House
  {
    id: "p19",
    businessId: "b14",
    name: "Combo doble cheeseburger",
    price: 9500,
    photoUrl: img("burger"),
    isOffer: true,
    offerLabel: "Combo con papas y bebida",
    keywords: ["hamburguesa", "burger", "comida", "combo", "delivery"],
  },

  // Atelier Marta
  {
    id: "p20",
    businessId: "b15",
    name: "Arreglo de prenda (ruedo)",
    price: 4000,
    photoUrl: img("costura"),
    isOffer: false,
    keywords: ["costura", "arreglo", "ropa", "ruedo", "confeccion"],
  },

  // TechCell
  {
    id: "p21",
    businessId: "b16",
    name: "Cambio de pantalla de celular",
    price: 30000,
    photoUrl: img("celular"),
    isOffer: true,
    offerLabel: "Con garantía 6 meses",
    keywords: ["celular", "pantalla", "reparacion", "telefono", "arreglo"],
  },
];
