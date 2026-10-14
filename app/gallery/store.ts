import { useSyncExternalStore } from "react";
import type { RoomId } from "./plan.ts";

export type Tier = "high" | "low";
export type GalleryState = {
  phase: "idle" | "loading" | "ready" | "fallback";
  entered: boolean;
  sound: boolean;
  menu: boolean;
  room: RoomId;
  tier: Tier;
};

let state: GalleryState = { phase: "idle", entered: false, sound: false, menu: false, room: "atrium", tier: "high" };
const subs = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<GalleryState>) {
    state = { ...state, ...patch };
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => { subs.delete(f); };
  },
};

/**
 * Scroll position as a continuous station index, written every frame by the page and read every
 * frame by the camera. Kept out of React state on purpose: nothing should re-render per frame.
 */
export const scroll = { u: 0, stations: 1, velocity: 0 };

export const useGallery = () => useSyncExternalStore(store.subscribe, store.get, store.get);
