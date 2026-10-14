"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Lenis from "lenis";
import { sceneForPath } from "./plan.ts";
import { screen, scroll, store, useGallery } from "./store.ts";
import { detectTier } from "./tier.ts";

const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

/**
 * The persistent machine: one canvas behind every page. Pages tag their sections with
 * `data-station` (camera shots) and `data-screen` (what plays on the CRT).
 */
export function Gallery() {
  const path = usePathname();
  const { phase } = useGallery();
  const [mount, setMount] = useState(false);

  // Route → room. The camera notices the change and walks there.
  useEffect(() => { store.set({ scene: sceneForPath(path), menu: false }); }, [path]);

  // Decide on live 3D once, after first paint, so the text is always the LCP.
  useEffect(() => {
    const go = () => {
      const tier = detectTier();
      if (tier === "fallback") store.set({ phase: "fallback" });
      else { store.set({ phase: "loading", tier }); setMount(true); }
    };
    const id = "requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 300);
    return () => ("cancelIdleCallback" in window ? cancelIdleCallback(id as number) : clearTimeout(id));
  }, []);

  // Smooth scroll + scroll → station index.
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduce ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    let raf = 0, last = scrollY;
    const tick = (t: number) => {
      lenis?.raf(t);
      const els = document.querySelectorAll<HTMLElement>("main [data-station]");
      const mid = innerHeight / 2;
      let u = 0, src = "";
      els.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid) u = i - 0.5 + Math.min((mid - r.top) / Math.max(r.height, 1), 1);
        if (r.top <= mid && r.bottom > mid) src = el.dataset.screen ?? "";
      });
      // Whatever the section in the middle of the screen asks to show, plays on the CRT.
      document.querySelectorAll<HTMLElement>("main [data-screen]:not([data-station])").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) src = el.dataset.screen!;
      });
      screen.src = src;
      scroll.stations = Math.max(els.length, 1);
      scroll.u = Math.min(Math.max(u, 0), scroll.stations - 1);
      scroll.velocity = scrollY - last;
      last = scrollY;
      document.documentElement.style.setProperty("--tour", String(scroll.stations > 1 ? scroll.u / (scroll.stations - 1) : 0));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); };
  }, []);

  // A new page starts at the top of its room.
  useEffect(() => { scrollTo(0, 0); }, [path]);

  return (
    <div className={`gallery-canvas${phase === "ready" ? " is-ready" : ""}`} aria-hidden="true">
      {mount && phase !== "fallback" && <Scene />}
    </div>
  );
}
