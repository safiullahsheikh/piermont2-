"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SCENES } from "../gallery/plan";
import { store, useGallery } from "../gallery/store";
import { FlowingMenu } from "./FlowingMenu";
import { setSound } from "./sound";

/**
 * The nav bar lives at the bottom of the screen: the Piermont signature, where you are,
 * the menu, sound and the way to start a project. It tucks away while you read down.
 */
export function NavBar() {
  const { menu, sound, scene } = useGallery();
  const [hidden, setHidden] = useState(false);
  const close = useCallback(() => store.set({ menu: false }), []);

  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const d = scrollY - last;
      last = scrollY;
      if (d > 14 && scrollY > 400) setHidden(true);
      else if (d < -6) setHidden(false);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {menu && <FlowingMenu onClose={close} />}
      <nav className={`bar${hidden && !menu ? " is-hidden" : ""}${menu ? " is-menu" : ""}`} aria-label="Primary">
        <Link href="/" className="bar-logo" aria-label="Piermont Studios, home">
          <Image src="/logo-cream.png" alt="" width={1316} height={552} sizes="120px" priority />
        </Link>
        <span className="bar-where" aria-live="polite">
          <span className="bar-dot" aria-hidden="true" />{SCENES[scene].label}
          <span className="bar-tour" aria-hidden="true"><i /></span>
        </span>
        <button type="button" className="bar-btn bar-menu" aria-expanded={menu} aria-controls="menu" onClick={() => store.set({ menu: !menu })}>
          <span className="bar-burger" aria-hidden="true"><i /><i /></span>{menu ? "Close" : "Menu"}
        </button>
        <button
          type="button"
          className={`bar-icon${sound ? " is-on" : ""}`}
          aria-pressed={sound}
          aria-label={sound ? "Sound on" : "Sound off"}
          onClick={() => { store.set({ sound: !sound }); setSound(!sound); }}
        >
          <span className="bar-eq" aria-hidden="true"><i /><i /><i /><i /></span>
        </button>
        <Link href="/contact" className="bar-btn bar-cta">Start a project</Link>
      </nav>
    </>
  );
}
