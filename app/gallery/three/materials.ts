import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export const AMBER = new THREE.Color("#ffb347");
export const TILE = 3; // metres per texture repeat

const TEX = {
  concrete: ["/gallery/tex/concrete-color.webp", "/gallery/tex/concrete-normal.webp", "/gallery/tex/concrete-rough.webp"],
  plaster: ["/gallery/tex/plaster-color.webp", "/gallery/tex/plaster-normal.webp", "/gallery/tex/plaster-rough.webp"],
};

export type Materials = ReturnType<typeof useMaterials>;

/** Every surface material in the building, built once. UVs are in metres / TILE (see `plane`). */
export function useMaterials() {
  const [cc, cn, cr, pc, pn, pr] = useTexture([...TEX.concrete, ...TEX.plaster]);
  return useMemo(() => {
    for (const t of [cc, cn, cr, pc, pn, pr]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 4;
    }
    cc.colorSpace = pc.colorSpace = THREE.SRGBColorSpace;
    // A black studio: matte walls that swallow light, a polished floor that holds its reflections.
    const concrete = new THREE.MeshStandardMaterial({ map: cc, normalMap: cn, roughnessMap: cr, color: "#24211e", normalScale: new THREE.Vector2(0.5, 0.5) });
    const floor = new THREE.MeshStandardMaterial({ map: cc, normalMap: cn, color: "#24221f", roughness: 0.2, normalScale: new THREE.Vector2(0.12, 0.12), envMapIntensity: 1.6 });
    const plaster = new THREE.MeshStandardMaterial({ map: pc, normalMap: pn, roughnessMap: pr, color: "#34312d", normalScale: new THREE.Vector2(0.3, 0.3) });
    const ceiling = new THREE.MeshStandardMaterial({ color: "#0c0b0a", roughness: 1 });
    // Satin ridges: charcoal acoustic flutes with a warm sheen, so tungsten light runs along each one.
    const satin = new THREE.MeshPhysicalMaterial({ color: "#2a2724", roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.35, sheen: 0.6, sheenRoughness: 0.45, sheenColor: new THREE.Color("#ffc27a") });
    const ink = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.55, metalness: 0.2 });
    // The Lightbox: a deep recess whose back wall glows from a hot core out to darkness, like light at the
    // end of a tunnel. Its side faces stay black. depthWrite off keeps AO out of its corners.
    const glow = document.createElement("canvas");
    glow.width = glow.height = 256;
    const g = glow.getContext("2d")!;
    const grad = g.createRadialGradient(128, 150, 0, 128, 150, 170);
    grad.addColorStop(0, "#ffe2b0"); grad.addColorStop(0.35, "#c9792c"); grad.addColorStop(0.75, "#2a1406"); grad.addColorStop(1, "#060403");
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(glow);
    glowTex.colorSpace = THREE.SRGBColorSpace;
    const lightbox = new THREE.MeshBasicMaterial({ map: glowTex, color: new THREE.Color(1, 1, 1).multiplyScalar(1.6), toneMapped: false, depthWrite: false });
    const lightboxSide = new THREE.MeshBasicMaterial({ color: "#070605", depthWrite: false });
    const strip = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb347").multiplyScalar(9), toneMapped: false });
    const warm = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffe4bd").multiplyScalar(3), toneMapped: false });
    return { concrete, floor, plaster, ceiling, satin, ink, lightbox, lightboxSide, strip, warm };
  }, [cc, cn, cr, pc, pn, pr]);
}

/** A plane whose UVs are in world metres / TILE, so every surface tiles at the same scale. */
export function plane(w: number, h: number) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / TILE, (uv.getY(i) * h) / TILE);
  return g;
}
