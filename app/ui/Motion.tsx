"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Page-wide motion for server-rendered markup:
 * - `data-reveal`: fades/lifts in when entering the viewport and back out when leaving it.
 * - `data-magnetic`: leans toward the pointer (fine pointers only).
 */
export function Motion() {
  const path = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting)),
      { rootMargin: "-8% 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-magnetic]")];
    const move = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement, r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.translate = `${dx * 0.22}px ${dy * 0.3}px`;
    };
    const leave = (e: PointerEvent) => { (e.currentTarget as HTMLElement).style.translate = ""; };
    els.forEach((el) => { el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave); });
    return () => els.forEach((el) => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
  }, [path]);

  return null;
}
