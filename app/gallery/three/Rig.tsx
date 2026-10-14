import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { poseAt, walk } from "../camera.ts";
import { ROOMS, route, type Pose, type RoomId } from "../plan.ts";
import { scroll, store } from "../store.ts";

const WALK_SPEED = 9; // m/s at full stride
const v = new THREE.Vector3();

/**
 * Drives the camera. Inside a room it follows the scroll-mapped station path; when the room
 * changes it walks there through the doorways, then hands back to scroll.
 */
export function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const at = useRef<RoomId | null>(null);
  const trip = useRef<{ path: Pose[]; t: number; len: number } | null>(null);
  const look = useRef(new THREE.Vector3());
  const pointer = useRef(new THREE.Vector2());
  const first = useRef(true);

  useFrame((state, dt) => {
    dt = Math.min(dt, 1 / 20);
    const { room, tier } = store.get();
    const stations = ROOMS[room].stations;

    if (at.current !== room) {
      if (at.current && !first.current) {
        const from: Pose = { pos: camera.position.toArray() as Pose["pos"], look: look.current.toArray() as Pose["look"], fov: camera.fov };
        const path = walk(from, route(at.current, room), stations[0]);
        let len = 0;
        for (let i = 1; i < path.length; i++) len += v.fromArray(path[i].pos).distanceTo(new THREE.Vector3(...path[i - 1].pos));
        trip.current = { path, t: 0, len };
      }
      at.current = room;
    }

    let target: Pose;
    const tr = trip.current;
    if (tr) {
      tr.t = Math.min(tr.t + (dt * WALK_SPEED) / Math.max(tr.len, 1), 1);
      const e = tr.t < 0.5 ? 2 * tr.t * tr.t : 1 - (-2 * tr.t + 2) ** 2 / 2; // ease in-out
      target = poseAt(tr.path, e * (tr.path.length - 1));
      if (tr.t >= 1) trip.current = null;
    } else {
      target = poseAt(stations, scroll.u);
    }

    // A breath of parallax from the pointer, desktop high tier only.
    pointer.current.lerp(state.pointer, 1 - Math.exp(-dt * 2));
    const px = tier === "high" ? pointer.current.x * 0.18 : 0, py = tier === "high" ? pointer.current.y * 0.1 : 0;

    const k = first.current ? 1 : 1 - Math.exp(-dt * (tr ? 8 : 4));
    camera.position.lerp(v.set(target.pos[0] + px, target.pos[1] + py, target.pos[2]), k);
    look.current.lerp(v.set(...target.look), k);
    camera.lookAt(look.current);
    // Stations are framed for landscape; on narrower screens widen the lens so the subject still fits.
    const aspect = state.size.width / Math.max(state.size.height, 1);
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
