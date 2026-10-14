"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WINGS } from "../content/wings";
import { DOORS, ROOM_ORDER, ROOMS, VOID, type RoomId } from "../gallery/plan";
import { useGallery } from "../gallery/store";
import { EMAIL, LOCATIONS, PHONE, SOCIALS } from "../site";

const X0 = -53, X1 = 97, Z0 = -19, Z1 = 32; // plan bounds, metres, with a margin
const pad = (n: number) => String(n).padStart(2, "0");
const BRANCHES = ROOM_ORDER.filter((id) => id !== "exhibit");

/**
 * The menu unfolds upward out of the Dock as three cards: the rooms as a branching tree
 * (the Wings fork into their six disciplines), the live floor plan, and the front desk.
 */
export function Menu({ onClose }: { onClose: () => void }) {
  const { room } = useGallery();
  const [hover, setHover] = useState<RoomId>(room);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current!;
    const prev = document.activeElement as HTMLElement | null;
    el.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const f = [...el.querySelectorAll<HTMLElement>("a, button")];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1)?.focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    };
    addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      prev?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const go = (id: RoomId) => ({ onPointerEnter: () => setHover(id), onFocus: () => setHover(id), onClick: onClose });

  return (
    <>
      <div className="menu-scrim" onClick={onClose} aria-hidden="true" />
      <div className="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" ref={box}>
        <nav className="menu-card menu-tree" aria-label="Rooms">
          <p className="k-kicker">The rooms</p>
          <ol>
            {BRANCHES.map((id) => {
              const r = ROOMS[id];
              return (
                <li key={id}>
                  <Link href={r.href} className="menu-room" aria-current={id === room ? "page" : undefined} {...go(id)}>
                    <span className="menu-no">{pad(r.no)}</span>{r.label}
                  </Link>
                  {id === "wings" && (
                    <ul className="menu-branch">
                      {WINGS.map((w) => (
                        <li key={w.slug}><Link href={`/services/${w.slug}`} className="menu-leaf" {...go("wings")}>{w.title}</Link></li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="menu-card menu-map" aria-label="Floor plan">
          <p className="k-kicker">Floor plan · you are in {ROOMS[room].label}</p>
          <svg viewBox={`${X0} ${Z0} ${X1 - X0} ${Z1 - Z0}`} className="plan-svg" aria-hidden="true">
            {ROOM_ORDER.map((id) => {
              const r = ROOMS[id];
              return <rect key={id} x={r.x0} y={r.z0} width={r.x1 - r.x0} height={r.z1 - r.z0} className={`plan-room${id === hover ? " is-hover" : ""}`} />;
            })}
            {DOORS.map((d) => {
              const a = ROOMS[d.a], alongX = d.at[0] === a.x0 || d.at[0] === a.x1;
              return alongX
                ? <line key={d.a + d.b} x1={d.at[0]} x2={d.at[0]} y1={d.at[2] - d.w / 2} y2={d.at[2] + d.w / 2} className="plan-door" />
                : <line key={d.a + d.b} x1={d.at[0] - d.w / 2} x2={d.at[0] + d.w / 2} y1={d.at[2]} y2={d.at[2]} className="plan-door" />;
            })}
            <rect x={VOID.x - VOID.w / 2} y={VOID.z - VOID.depth} width={VOID.w} height={VOID.depth} className="plan-void" />
            {ROOM_ORDER.map((id) => {
              const r = ROOMS[id];
              return <text key={id} x={(r.x0 + r.x1) / 2} y={(r.z0 + r.z1) / 2} className="plan-label">{pad(r.no)}</text>;
            })}
            <circle cx={ROOMS[room].stations[0].pos[0]} cy={ROOMS[room].stations[0].pos[2]} r={1.2} className="plan-you" />
          </svg>
          <p className="menu-punch" key={hover}>{ROOMS[hover].punch}</p>
        </section>

        <section className="menu-card menu-desk" aria-label="Front desk">
          <p className="k-kicker">Front desk</p>
          <a href={`mailto:${EMAIL}`} className="menu-line">{EMAIL}</a>
          <a href={PHONE.href} className="menu-line">{PHONE.display}</a>
          {LOCATIONS.map((l) => <p key={l.country} className="menu-addr"><b>{l.city}</b>{l.address}</p>)}
          <p className="menu-socials">{SOCIALS.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="k-chip">{s.label}</a>)}</p>
        </section>
      </div>
    </>
  );
}
