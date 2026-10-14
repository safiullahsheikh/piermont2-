import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { flight, poseAt } from "../camera.ts";
import { SCENES, type Pose, type SceneId } from "../plan.ts";
import { scroll, store } from "../store.ts";

const FLIGHT_S = 1.9;
const v = new THREE.Vector3();

/**
 * Drives the camera. Within a page it follows the scroll-mapped stations; when the page
 * changes it craned up and around the machine to the new page's first shot.
 */
export function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const at = useRef<SceneId | null>(null);
  const trip = useRef<{ path: Pose[]; t: number } | null>(null);
  const look = useRef(new THREE.Vector3());
  const pointer = useRef(new THREE.Vector2());
  const first = useRef(true);

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20);
    const { scene, tier } = store.get();
    const stations = SCENES[scene].stations;

    if (at.current !== scene) {
      if (at.current && !first.current) {
        const from: Pose = { pos: camera.position.toArray() as Pose["pos"], look: look.current.toArray() as Pose["look"], fov: camera.fov };
        trip.current = { path: flight(from, stations[0]), t: 0 };
      }
      at.current = scene;
    }

    let target: Pose;
    const tr = trip.current;
    if (tr) {
      tr.t = Math.min(tr.t + dt / FLIGHT_S, 1);
      const e = tr.t < 0.5 ? 4 * tr.t ** 3 : 1 - (-2 * tr.t + 2) ** 3 / 2;
      target = poseAt(tr.path, e * (tr.path.length - 1));
      if (tr.t >= 1) trip.current = null;
    } else {
      target = poseAt(stations, scroll.u);
    }

    // A breath of parallax from the pointer, desktop high tier only.
    pointer.current.lerp(state.pointer, 1 - Math.exp(-dt * 2));
    const px = tier === "high" ? pointer.current.x * 0.25 : 0, py = tier === "high" ? pointer.current.y * 0.12 : 0;

    // Portrait: drop the side-by-side composition; the machine sits in the top half, copy below.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    if (aspect < 1) target = { pos: [target.pos[0] * 0.5, target.pos[1], target.pos[2]], look: [target.look[0] * 0.1, target.look[1] - 2.4, target.look[2]], fov: target.fov };

    const k = first.current ? 1 : 1 - Math.exp(-dt * (tr ? 10 : 4));
    camera.position.lerp(v.set(target.pos[0] + px, target.pos[1] + py, target.pos[2]), k);
    look.current.lerp(v.set(...target.look), k);
    camera.lookAt(look.current);
    // Shots are framed for landscape; on narrower screens widen the lens so the subject still fits.
    const fov = aspect >= 1.2 ? target.fov
      : Math.min(78, THREE.MathUtils.radToDeg(2 * Math.atan((Math.tan(THREE.MathUtils.degToRad(target.fov) / 2) * 1.2) / aspect)));
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov += (fov - camera.fov) * k;
      camera.updateProjectionMatrix();
    }
    first.current = false;
  });
  return null;
}
