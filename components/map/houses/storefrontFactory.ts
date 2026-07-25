import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Business, Category } from "@/types";

/**
 * Fábrica de LOCALES 3D estilo "clay/toy", diferenciados POR RUBRO (categoría).
 *
 * Cada categoría tiene su paleta, toldo rayado, vidriera y un emblema 3D en el techo
 * (taza = gastronomía, cartera = indumentaria, engranaje = servicios, sofá = showrooms).
 *
 * Construcción en el espacio nativo de Three.js (eje +Y = arriba, frente hacia +Z).
 * La capa `ThreeHouseLayer` ancla el modelo al sistema mercator de MapLibre. Medidas en METROS.
 */

export interface StorefrontObject {
  group: THREE.Group;
  /** Materiales que se "encienden" (emissive) al resaltar en la búsqueda. */
  glowMats: THREE.MeshStandardMaterial[];
  /** Anillo en el piso (marcador de resaltado). */
  halo: THREE.Mesh;
  /** Pin dorado flotante sobre el local (aparece al resaltar). */
  pin: THREE.Group;
  dimMats: THREE.MeshStandardMaterial[];
  height: number;
}

interface Palette {
  wall: string;
  accent: string; // color del rubro (fascia, puerta)
  trim: string;
  glass: string;
  awning: [string, string];
  rim: string;
  emblem: string;
}

const PALETTES: Record<Category, Palette> = {
  gastronomia: {
    wall: "#f5e4c3",
    accent: "#e2603a",
    trim: "#ffffff",
    glass: "#bcdfe0",
    awning: ["#e2603a", "#fbf1df"],
    rim: "#6d5844",
    emblem: "#ffffff",
  },
  indumentaria: {
    wall: "#f7a8c4",
    accent: "#ec6fa0",
    trim: "#ffffff",
    glass: "#c6e6e8",
    awning: ["#4bb3b8", "#ffffff"],
    rim: "#cf5b86",
    emblem: "#49b7bd",
  },
  servicios: {
    wall: "#e28a4b",
    accent: "#454a52",
    trim: "#e9edf2",
    glass: "#93d6da",
    awning: ["#454a52", "#cfd6dd"],
    rim: "#383d45",
    emblem: "#454a52",
  },
  showrooms: {
    wall: "#7ec6a8",
    accent: "#e0a13c",
    trim: "#ffffff",
    glass: "#d0eadc",
    awning: ["#e0a13c", "#fff6e6"],
    rim: "#3f7c63",
    emblem: "#e0a13c",
  },
};

const BASE_COLOR = "#5f5147";

function std(color: string, roughness = 0.6, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    transparent: true,
    opacity: 1,
  });
}

/** Material que puede "encenderse" (emissive del propio color, apagado por defecto). */
function glowStd(color: string, roughness = 0.6) {
  const m = std(color, roughness);
  m.emissive = new THREE.Color(color);
  m.emissiveIntensity = 0;
  return m;
}

function rbox(w: number, h: number, d: number, radius: number, material: THREE.Material) {
  const r = Math.max(0.02, Math.min(radius, w / 2, h / 2, d / 2));
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), material);
}

/** Toldo rayado inclinado, mirando hacia +Z. */
function makeAwning(
  width: number,
  depth: number,
  colors: [string, string],
  track: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial
): THREE.Group {
  const g = new THREE.Group();
  const stripes = 7;
  const sw = width / stripes;
  const mats = [track(std(colors[0], 0.55)), track(std(colors[1], 0.55))];
  for (let i = 0; i < stripes; i++) {
    const stripe = rbox(sw * 0.98, 0.28, depth, 0.08, mats[i % 2]);
    stripe.position.set(-width / 2 + sw / 2 + i * sw, 0, 0);
    g.add(stripe);
    // Faldón frontal (valance)
    const val = rbox(sw * 0.98, 0.55, 0.22, 0.08, mats[i % 2]);
    val.position.set(-width / 2 + sw / 2 + i * sw, -0.32, depth / 2);
    g.add(val);
  }
  g.rotation.x = -0.32; // inclinación hacia adelante
  return g;
}

// ---------- Emblemas por rubro ----------

function emblemGastronomia(p: Palette, track: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial) {
  const g = new THREE.Group();
  const white = track(std(p.emblem, 0.5));
  const coffee = track(std("#6f4a2f", 0.6));
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.16, 24), white);
  g.add(saucer);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.62, 1.15, 24), white);
  body.position.y = 0.72;
  g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 24), coffee);
  top.position.y = 1.27;
  g.add(top);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.11, 12, 24), white);
  handle.position.set(0.82, 0.72, 0);
  handle.rotation.y = Math.PI / 2;
  g.add(handle);
  return g;
}

function emblemIndumentaria(p: Palette, track: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial) {
  const g = new THREE.Group();
  const bag = track(std(p.emblem, 0.5));
  const gold = track(std("#f2c14e", 0.4, 0.3));
  const body = rbox(1.7, 1.25, 0.7, 0.28, bag);
  body.position.y = 0.62;
  g.add(body);
  const flap = rbox(1.75, 0.5, 0.74, 0.22, bag);
  flap.position.y = 1.15;
  g.add(flap);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 12, 24, Math.PI), track(std(p.emblem, 0.5)));
  handle.position.y = 1.35;
  g.add(handle);
  const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), gold);
  clasp.position.set(0, 0.9, 0.4);
  g.add(clasp);
  return g;
}

function emblemServicios(p: Palette, track: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial) {
  const g = new THREE.Group();
  const steel = track(std(p.emblem, 0.4, 0.35));
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.45, 24), steel);
  core.rotation.x = Math.PI / 2; // cara hacia +Z
  g.add(core);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tooth = rbox(0.34, 0.34, 0.45, 0.08, steel);
    tooth.position.set(Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0);
    g.add(tooth);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.5, 20), track(std("#e9edf2", 0.4)));
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.02;
  g.add(hub);
  g.position.y = 1.0;
  return g;
}

function emblemShowrooms(p: Palette, track: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial) {
  const g = new THREE.Group();
  const sofa = track(std(p.emblem, 0.6));
  const seat = rbox(2.2, 0.5, 1.0, 0.18, sofa);
  seat.position.y = 0.45;
  g.add(seat);
  const back = rbox(2.2, 0.85, 0.32, 0.16, sofa);
  back.position.set(0, 0.85, -0.34);
  g.add(back);
  for (const sx of [-1, 1]) {
    const arm = rbox(0.34, 0.7, 1.0, 0.14, sofa);
    arm.position.set(sx * 1.03, 0.6, 0);
    g.add(arm);
  }
  return g;
}

function makeEmblem(
  category: Category,
  p: Palette,
  track: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial
): THREE.Group {
  switch (category) {
    case "gastronomia":
      return emblemGastronomia(p, track);
    case "indumentaria":
      return emblemIndumentaria(p, track);
    case "servicios":
      return emblemServicios(p, track);
    case "showrooms":
      return emblemShowrooms(p, track);
  }
}

export function createStorefront(business: Business): StorefrontObject {
  const p = PALETTES[business.category];
  const W = 16.5;
  const D = 13.5;
  const storyH = 8.5;

  const group = new THREE.Group();
  const dimMats: THREE.MeshStandardMaterial[] = [];
  const track = (m: THREE.MeshStandardMaterial) => {
    dimMats.push(m);
    return m;
  };

  const wallMat = track(glowStd(p.wall));
  const trimMat = track(std(p.trim, 0.5));
  const glassMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.glass),
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: 1,
      emissive: new THREE.Color(p.glass),
      emissiveIntensity: 0.06,
    })
  );
  dimMats.push(glassMat);
  const accentMat = track(glowStd(p.accent, 0.5));
  const rimMat = track(std(p.rim, 0.55));
  const baseMat = track(std(BASE_COLOR, 0.7));
  // Fascia (cartel) — se enciende en la búsqueda
  const fasciaMat = track(glowStd(p.accent, 0.5));

  // --- Base ---
  const baseH = 1.0;
  const base = rbox(W + 4.5, baseH, D + 4.5, 0.8, baseMat);
  base.position.y = baseH / 2;
  group.add(base);
  const ground = baseH;

  // --- Cuerpo ---
  const body = rbox(W, storyH, D, 0.4, wallMat);
  body.position.y = ground + storyH / 2;
  group.add(body);
  const roofY = ground + storyH;

  // --- Zócalo inferior ---
  const plinth = rbox(W + 0.3, 0.8, D + 0.3, 0.2, rimMat);
  plinth.position.y = ground + 0.4;
  group.add(plinth);

  // --- Vidriera (frente +Z) ---
  const winW = W * 0.5;
  const winH = storyH * 0.42;
  const winY = ground + storyH * 0.42;
  const shopFrame = rbox(winW + 0.5, winH + 0.5, 0.3, 0.14, trimMat);
  shopFrame.position.set(-W * 0.14, winY, D / 2);
  group.add(shopFrame);
  const shopGlass = rbox(winW, winH, 0.16, 0.08, glassMat);
  shopGlass.position.set(-W * 0.14, winY, D / 2 + 0.14);
  group.add(shopGlass);
  // travesaño vertical de la vidriera
  const mull = rbox(0.16, winH, 0.1, 0.05, trimMat);
  mull.position.set(-W * 0.14, winY, D / 2 + 0.2);
  group.add(mull);

  // --- Puerta de vidrio (frente +Z, a la derecha) ---
  const doorW = 2.0;
  const doorH = storyH * 0.62;
  const doorFrame = rbox(doorW + 0.4, doorH + 0.3, 0.3, 0.12, trimMat);
  doorFrame.position.set(W * 0.3, ground + (doorH + 0.3) / 2, D / 2);
  group.add(doorFrame);
  const doorGlass = rbox(doorW, doorH, 0.16, 0.06, glassMat);
  doorGlass.position.set(W * 0.3, ground + doorH / 2, D / 2 + 0.13);
  group.add(doorGlass);
  const handle = rbox(0.14, 0.9, 0.14, 0.06, accentMat);
  handle.position.set(W * 0.3 - doorW * 0.3, ground + doorH * 0.45, D / 2 + 0.24);
  group.add(handle);

  // --- Ventanas laterales (±X) ---
  for (const sx of [-1, 1]) {
    const sideFrame = rbox(2.4, 2.2, 0.3, 0.12, trimMat);
    sideFrame.rotation.y = Math.PI / 2;
    sideFrame.position.set(sx * (W / 2), ground + storyH * 0.5, D * 0.05);
    group.add(sideFrame);
    const sideGlass = rbox(1.9, 1.7, 0.16, 0.07, glassMat);
    sideGlass.rotation.y = Math.PI / 2;
    sideGlass.position.set(sx * (W / 2 + 0.13), ground + storyH * 0.5, D * 0.05);
    group.add(sideGlass);
  }

  // --- Fascia / cartel (banda de color arriba del frente) ---
  const fascia = rbox(W + 0.2, 1.2, D + 0.2, 0.18, fasciaMat);
  fascia.position.y = roofY - 0.9;
  group.add(fascia);

  // --- Toldo rayado sobre la vidriera ---
  const awning = makeAwning(W * 0.62, 2.0, p.awning, track);
  awning.position.set(-W * 0.14, ground + storyH * 0.66, D / 2 + 0.6);
  group.add(awning);

  // --- Parapeto (borde redondeado del techo plano) ---
  const rim = rbox(W + 0.6, 0.7, D + 0.6, 0.3, rimMat);
  rim.position.y = roofY + 0.15;
  group.add(rim);
  // Piso del techo
  const roofDeck = rbox(W - 0.4, 0.3, D - 0.4, 0.15, track(std(p.rim, 0.8)));
  roofDeck.position.y = roofY - 0.05;
  group.add(roofDeck);

  // --- Emblema del rubro sobre el techo ---
  const emblem = makeEmblem(business.category, p, track);
  emblem.scale.setScalar(1.75);
  emblem.position.set(W * 0.02, roofY + 0.5, -D * 0.05);
  group.add(emblem);
  const emblemH = roofY + 0.5 + 4;

  // --- Anillo de resaltado en el piso (blending normal para verse sobre mapa claro) ---
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#ff9500"),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const haloInner = (Math.max(W, D) + 4.5) / 2 + 1.2;
  const halo = new THREE.Mesh(new THREE.RingGeometry(haloInner, haloInner + 3.2, 64), haloMat);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.12;
  group.add(halo);

  // --- Pin dorado flotante (aparece al resaltar) ---
  const pin = new THREE.Group();
  const pinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ffb300"),
    emissive: new THREE.Color("#ff9500"),
    emissiveIntensity: 0.5,
    roughness: 0.35,
    metalness: 0.1,
    transparent: true,
    opacity: 1,
  });
  const pinBody = new THREE.Mesh(new THREE.SphereGeometry(2.3, 28, 22), pinMat);
  pinBody.scale.set(1, 1.15, 1);
  pin.add(pinBody);
  const pinTip = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.0, 28), pinMat);
  pinTip.position.y = -2.7;
  pin.add(pinTip);
  const pinDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.4,
      roughness: 0.4,
    })
  );
  pinDot.position.set(0, 0.5, 1.7);
  pin.add(pinDot);
  pin.position.set(0, emblemH + 6, 0);
  pin.visible = false;
  group.add(pin);

  group.userData.height = emblemH;

  return {
    group,
    glowMats: [wallMat, fasciaMat, accentMat],
    halo,
    pin,
    dimMats,
    height: emblemH,
  };
}
