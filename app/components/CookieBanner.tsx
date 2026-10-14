"use client";

import { useSyncExternalStore } from "react";

const KEY = "piermont-cookie-consent";
const EVENT = "piermont-consent-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

// Fallback when storage is blocked, so the choice still sticks for this visit.
let memoryConsent = "";

function readConsent() {
  try {
    return localStorage.getItem(KEY) ?? memoryConsent;
  } catch {
    return memoryConsent;
  }
}

/** Read this before loading any analytics or marketing script. */
export function hasCookieConsent() {
  return readConsent() === "accepted";
}

export function CookieBanner() {
  // "unset" on the server so nothing renders until we know the stored choice.
  const consent = useSyncExternalStore(subscribe, readConsent, () => "unset");

  if (consent !== "") return null;

  const choose = (value: "accepted" | "declined") => {
    memoryConsent = value;
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // Storage blocked: memoryConsent keeps it hidden for this visit.
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <div
      className="cookie-banner"
      role="region"
      aria-label="Cookie consent"
    >
      <p className="cookie-banner-text">
        We use cookies to improve your experience and understand how the site
        is used.
      </p>
      <div className="cookie-banner-actions">
        <button
          type="button"
          className="cookie-banner-btn is-ghost"
          onClick={() => choose("declined")}
        >
          Decline
        </button>
        <button
          type="button"
          className="cookie-banner-btn"
          onClick={() => choose("accepted")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
