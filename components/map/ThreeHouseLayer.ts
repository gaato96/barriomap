import * as THREE from "three";
import maplibregl, { type CustomLayerInterface, type Map as MLMap } from "maplibre-gl";
import type { Business } from "@/types";
import { createStorefront } from "./houses/storefrontFactory";

/** Debajo de este zoom se ocultan las casitas 3D y se muestran clústeres 2D. */
export const LOD_ZOOM = 14.3;

/** Punto de referencia fijo del mundo local (centro del barrio). */
const ORIGIN_LNGLAT: [number, number] = [-65.2219, -26.8235];

interface HouseRecord {
  id: string;
  group: THREE.Group;
  glowMats: THREE.MeshStandardMaterial[];
  halo: THREE.Mesh;
  pin: THREE.Group;
  pinBaseY: number;
  dimMats: THREE.MeshStandardMaterial[];
  highlighted: boolean;
  dimmed: boolean;
}

function extractMatrix(arg: unknown): number[] {
  if (arg instanceof Float32Array || Array.isArray(arg)) return arg as number[];
  const a = arg as {
    defaultProjectionData?: { mainMatrix?: number[] };
    modelViewProjectionMatrix?: number[];
  };
  if (a?.defaultProjectionData?.mainMatrix) return a.defaultProjectionData.mainMatrix;
  if (a?.modelViewProjectionMatrix) return a.modelViewProjectionMatrix;
  return arg as number[];
}

/**
 * Custom layer de MapLibre que renderiza las casitas 3D con Three.js.
 *
 * Anclaje: patrón "world-origin". Se elige un punto de referencia fijo (ORIGIN) y cada
 * casa se posiciona en METROS relativos a él, con la casa construida en el espacio nativo
 * de Three (y-up). La conversión metros→mercator (traslación + escala + rotación X) se
 * hornea en la matriz de proyección de la cámara CADA frame. Así los vértices manejan
 * números chicos y estables (nada de jitter), y las casas quedan clavadas a su coordenada
 * al rotar, inclinar o hacer zoom.
 */
export class ThreeHouseLayer implements CustomLayerInterface {
  id = "barriomap-houses";
  type = "custom" as const;
  renderingMode = "3d" as const;

  private map!: MLMap;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private records: HouseRecord[] = [];
  private filtering = false;
  private clock = new THREE.Clock();

  private origin!: maplibregl.MercatorCoordinate;
  private originScale = 1;

  constructor(private businesses: Business[]) {}

  onAdd(map: MLMap, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.map = map;
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

    this.origin = maplibregl.MercatorCoordinate.fromLngLat(
      { lng: ORIGIN_LNGLAT[0], lat: ORIGIN_LNGLAT[1] },
      0
    );
    this.originScale = this.origin.meterInMercatorCoordinateUnits();

    // Iluminación suave tipo maqueta/clay
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xd7c9b8, 1.15));
    const key = new THREE.DirectionalLight(0xfff6e8, 1.9);
    key.position.set(0.5, 1, 0.75);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xdceaff, 0.7);
    fill.position.set(-0.6, 0.5, -0.4);
    this.scene.add(fill);

    for (const business of this.businesses) {
      const { group, glowMats, halo, pin, dimMats } = createStorefront(business);

      const merc = maplibregl.MercatorCoordinate.fromLngLat(
        { lng: business.lng, lat: business.lat },
        0
      );
      // Posición en METROS relativos al origen (x=este, z=norte según convención de la cámara)
      group.position.set(
        (merc.x - this.origin.x) / this.originScale,
        0,
        (merc.y - this.origin.y) / this.originScale
      );

      this.scene.add(group);
      this.records.push({
        id: business.id,
        group,
        glowMats,
        halo,
        pin,
        pinBaseY: pin.position.y,
        dimMats,
        highlighted: false,
        dimmed: false,
      });
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    });
    this.renderer.autoClear = false;
  }

  setHighlight(matchedIds: Set<string> | null) {
    this.filtering = matchedIds !== null;
    for (const r of this.records) {
      if (!matchedIds) {
        r.highlighted = false;
        r.dimmed = false;
      } else {
        r.highlighted = matchedIds.has(r.id);
        r.dimmed = !r.highlighted;
      }
      this.applyState(r);
    }
    this.map?.triggerRepaint();
  }

  private applyState(r: HouseRecord) {
    const opacity = r.dimmed ? 0.14 : 1;
    for (const m of r.dimMats) m.opacity = opacity;
    r.pin.visible = r.highlighted;
    if (!r.highlighted) {
      (r.halo.material as THREE.MeshBasicMaterial).opacity = 0;
      r.halo.scale.setScalar(1);
      for (const m of r.glowMats) m.emissiveIntensity = 0;
    }
  }

  render(gl: WebGLRenderingContext | WebGL2RenderingContext, args: unknown) {
    if (this.map.getZoom() < LOD_ZOOM) return;

    const matrix = extractMatrix(args);

    // Matriz local->mercator: T(origin) * S(scale,-scale,scale) * Rx(90°)
    const rotX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    const local = new THREE.Matrix4()
      .makeTranslation(this.origin.x, this.origin.y, this.origin.z)
      .scale(new THREE.Vector3(this.originScale, -this.originScale, this.originScale))
      .multiply(rotX);
    this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(local);

    // Animación de resaltado: anillo pulsante + pin flotante que rebota + encendido
    let animating = false;
    if (this.filtering) {
      const t = this.clock.getElapsedTime();
      const wave = 0.5 + 0.5 * Math.sin(t * 3.2);
      const bob = Math.sin(t * 2.4);
      for (const r of this.records) {
        if (r.highlighted) {
          const haloMat = r.halo.material as THREE.MeshBasicMaterial;
          haloMat.opacity = 0.6 + 0.35 * wave;
          r.halo.scale.setScalar(1 + 0.3 * wave);
          for (const m of r.glowMats) m.emissiveIntensity = 0.65 + 0.5 * wave;
          r.pin.position.y = r.pinBaseY + bob * 1.8;
          r.pin.rotation.y = t * 1.6;
          animating = true;
        }
      }
    }

    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);

    if (animating) this.map.triggerRepaint();
  }

  onRemove() {
    for (const r of this.records) {
      r.group.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const m = mesh.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    }
    this.records = [];
    this.renderer?.dispose();
  }
}
