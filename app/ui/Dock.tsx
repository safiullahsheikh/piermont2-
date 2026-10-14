"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ROOMS } from "../gallery/plan";
import { store, useGallery } from "../gallery/store";
import { setSound } from "./sound";
import { Menu } from "./Menu";

const pad = (n: number) => String(n).padStart(2, "0");
// A spring with a little overshoot, sampled for CSS `linear()`.
const SPRING = "linear(0, 0.21 6%, 0.65 14%, 0.97 24%, 1.08 32%, 1.06 40%, 1.01 52%, 0.99 66%, 1)";

/**
 * The Dock: navigation lives at the bottom of the screen as one bar that morphs between
 * entry → browsing → menu-open. It hides while you read downward and returns when you look up.
 */
export function Dock() {
  const { entered, menu, sound, room } = useGallery();
  const bar = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const [hidden, setHidden] = useState(false);
  const state = menu ? "menu" : entered ? "nav" : "entry";

  // FLIP the width so the bar morphs instead of jumping.
  useLayoutEffect(() => {
    const el = bar.current!;
    const w = el.offsetWidth;
    if (width.current && width.current !== w && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.animate([{ width: `${width.current}px` }, { width: `${w}px` }], { duration: 700, easing: SPRING });
    }
    width.current = w;
  }, [state, room]);

  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const d = scrollY - last;
      last = scrollY;
      if (scrollY > 40 && !store.get().entered) store.set({ entered: true });
      if (d > 14 && scrollY > 300) setHidden(true);
      else if (d < -6) setHidden(false);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const enter = (withSound: boolean) => {
    store.set({ entered: true, sound: withSound });
    setSound(withSound);
  };
  const r = ROOMS[room];
  const closeMenu = useCallback(() => store.set({ menu: false }), []);

  return (
    <>
      {menu && <Menu onClose={closeMenu} />}
      <nav className={`dock${hidden && !menu ? " is-hidden" : ""}`} aria-label="Gallery" data-state={state}>
        <div className="dock-bar" ref={bar}>
          {state === "entry" && (
            <div className="dock-row" key="entry">
              <button type="button" className="dock-btn dock-btn--accent" onClick={() => enter(true)}>
                <span className="dock-eq" aria-hidden="true"><i /><i /><i /></span>Enter with sound
              </button>
              <button type="button" className="dock-btn" onClick={() => enter(false)}>Enter quietly</button>
            </div>
          )}
          {state === "nav" && (
            <div className="dock-row" key="nav">
              <Link href="/" className="dock-mark" aria-label="Piermont, home">P</Link>
              <div className="dock-where" aria-live="polite">
                <span className="dock-no">{pad(r.no)}</span>
                <span className="dock-room">{r.label}</span>
                <span className="dock-tour" aria-hidden="true"><i /></span>
              </div>
              <button type="button" className="dock-btn" aria-expanded={false} aria-controls="menu" onClick={() => store.set({ menu: true })}>
                Menu
              </button>
              <button
                type="button"
                className={`dock-icon${sound ? " is-on" : ""}`}
                aria-pressed={sound}
                aria-label={sound ? "Sound on" : "Sound off"}
                onClick={() => { store.set({ sound: !sound }); setSound(!sound); }}
              >
                <span className="dock-eq" aria-hidden="true"><i /><i /><i /></span>
              </button>
              <Link href="/contact" className="dock-btn dock-btn--accent dock-cta">Start a project</Link>
            </div>
          )}
          {state === "menu" && (
            <div className="dock-row" key="menu">
              <button type="button" className="dock-btn dock-btn--ink" aria-expanded aria-controls="menu" onClick={closeMenu}>
                Close
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
