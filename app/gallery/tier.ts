import type { Tier } from "./store.ts";

/** "fallback" = no live 3D at all (no WebGL2, `?gl=off`, or reduced motion): show prerendered stills. */
export function detectTier(): Tier | "fallback" {
  if (new URLSearchParams(location.search).get("gl") === "off") return "fallback";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "fallback";
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return "fallback";
  const forced = new URLSearchParams(location.search).get("tier");
  if (forced === "high" || forced === "low") return forced;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  // Integrated and mobile GPUs get the light pipeline; small high-DPR screens are phones.
  if (/Intel|Mali|Adreno|PowerVR|Apple GPU|SwiftShader|llvmpipe/i.test(gpu)) return "low";
  if (innerWidth < 900) return "low";
  return "high";
}
