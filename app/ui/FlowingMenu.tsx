"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { POSTS, postMedia } from "../content/posts";
import { PROJECTS } from "../content/projects";
import { EMAIL, LOCATIONS, PHONE, SOCIALS } from "../site";

const pick = (n: number, from: string[]) => from.slice(0, n);
const ITEMS = [
  { href: "/work", text: "Work", note: `${PROJECTS.length} projects`, images: pick(4, PROJECTS.map((p) => p.image)) },
  { href: "/services", text: "Services", note: "6 disciplines", images: pick(4, PROJECTS.slice(6).map((p) => p.image)) },
  { href: "/studio", text: "Studio", note: "Sheridan · London", images: ["/about-studio.png", "/testimonial-1.png", "/testimonial-2.png", "/testimonial-3.png"] },
  { href: "/journal", text: "Journal", note: `${POSTS.length} notes`, images: pick(4, POSTS.map((p) => postMedia(p).poster)) },
  { href: "/contact", text: "Contact", note: "Start a project", images: ["/contact-mockup.png", "/project-brands.png", "/project-hope.png", "/project-sprint.png"] },
];

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/** Which edge of a row the pointer came in through (or leaves by). */
const edgeOf = (e: React.MouseEvent, el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return e.clientY - r.top < r.height / 2 ? "top" : "bottom";
};

function Row({ item, current, i }: { item: (typeof ITEMS)[number]; current: boolean; i: number }) {
  const row = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  // The band slides in from the edge you entered by while its contents slide the other way, so the text stays put.
  const move = (e: React.MouseEvent, entering: boolean) => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const off = edgeOf(e, row.current!) === "top" ? "-101%" : "101%";
    const back = off === "-101%" ? "101%" : "-101%";
    const opts = { duration: entering ? 520 : 380, easing: EASE, fill: "forwards" as const };
    band.current!.animate([{ translate: entering ? `0 ${off}` : "0 0" }, { translate: entering ? "0 0" : `0 ${off}` }], opts);
    inner.current!.animate([{ translate: entering ? `0 ${back}` : "0 0" }, { translate: entering ? "0 0" : `0 ${back}` }], opts);
  };

  const tiles = [0, 1].flatMap((k) => item.images.map((src, j) => (
    <span key={`${k}${j}`} className="fm-tile">
      <span className="fm-tile-text">{item.text}</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative thumbnails in a moving band */}
      <img src={src} alt="" loading="lazy" decoding="async" />
    </span>
  )));

  return (
    <div ref={row} className="fm-row" style={{ "--i": i } as React.CSSProperties}>
      <Link href={item.href} className="fm-link" aria-current={current ? "page" : undefined}
        onMouseEnter={(e) => move(e, true)} onMouseLeave={(e) => move(e, false)}>
        <span className="fm-text">{item.text}</span>
        <span className="fm-note">{item.note}</span>
      </Link>
      <div ref={band} className="fm-band" aria-hidden="true">
        <div ref={inner} className="fm-band-inner">
          <div className="fm-track">{tiles}</div>
        </div>
      </div>
    </div>
  );
}

/** Full-screen menu: one row per page; hovering a row runs a marquee of that page's work through it. */
export function FlowingMenu({ onClose }: { onClose: () => void }) {
  const path = usePathname();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    root.current?.querySelector<HTMLElement>(".fm-link")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const f = [...document.querySelectorAll<HTMLElement>("#menu a, .bar a, .bar button")];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1)?.focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0]?.focus(); }
    };
    addEventListener("keydown", key);
    document.documentElement.classList.add("is-locked");
    return () => { removeEventListener("keydown", key); document.documentElement.classList.remove("is-locked"); prev?.focus(); };
  }, [onClose]);

  return (
    <div ref={root} id="menu" className="fm" role="dialog" aria-modal="true" aria-label="Menu">
      <nav className="fm-rows" aria-label="Pages">
        {ITEMS.map((item, i) => <Row key={item.href} item={item} i={i} current={path.startsWith(item.href)} />)}
      </nav>
      <div className="fm-foot">
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <a href={PHONE.href}>{PHONE.display}</a>
        {LOCATIONS.map((l) => <span key={l.country}>{l.city}</span>)}
        <span className="fm-socials">{SOCIALS.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>)}</span>
      </div>
    </div>
  );
}
