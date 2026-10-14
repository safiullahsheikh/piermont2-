"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { LazyVideo } from "./LazyVideo";

const SERVICE_OPTIONS = [
  "Brand Strategy",
  "Brand Identity",
  "User Experience Design",
  "Visual Content",
  "Web Development",
  "eCommerce",
  "Web & Mobile Applications",
  "Embedded & Hardware",
] as const;

const BUDGETS = ["$2,000", "$4,000", "$8,000", "$16,000+"] as const;

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function ContactSection({
  headingLevel = "h2",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState<(typeof BUDGETS)[number] | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current || widgetIdRef.current)
        return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        action: "contact",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
    };

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile="true"]',
    );
    if (window.turnstile) {
      renderWidget();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.dataset.turnstile = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderWidget);
    }

    return () => {
      script?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const toggleService = (label: string) => {
    setServices((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  };

  const resetCaptcha = () => {
    setTurnstileToken("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!turnstileToken) {
      setStatus("error");
      setErrorMessage("Please complete the captcha.");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          project: String(data.get("project") ?? ""),
          services,
          budget,
          turnstileToken,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setErrorMessage(json.error || "Something went wrong. Please try again.");
        resetCaptcha();
        return;
      }
      setStatus("ok");
      form.reset();
      setServices([]);
      setBudget(null);
      resetCaptcha();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
      resetCaptcha();
    }
  };

  return (
    <section id="contact" className="contact-section" aria-label="Contact">
      <div className="contact-bg-title" aria-hidden="true" data-reveal="scale">
        CONTACT
      </div>

      <div className="contact-inner">
        <div className="contact-form-label" data-reveal>
          <p>Form</p>
          <div className="contact-form-rule">
            <span className="contact-form-rule-accent" />
            <span className="contact-form-rule-rest" />
          </div>
        </div>

        <Heading className="contact-heading" data-reveal="left">
          Ready to get
          <br />
          started?
        </Heading>

        <div className="contact-body">
          <div className="contact-mockup" data-reveal="left">
            <LazyVideo
              className="contact-mockup-video"
              src="/OtherAssets/contact.mp4"
            />
          </div>

          <form
            className="contact-form"
            data-reveal="right"
            style={{ ["--reveal-delay" as string]: "100ms" }}
            onSubmit={onSubmit}
          >
            <p className="contact-form-intro">
              FILL THE FORM TO REQUEST A QUOTE:
            </p>

            <div className="contact-row-2">
              <label className="contact-field">
                <span className="sr-only">Your Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your Name *"
                  autoComplete="name"
                />
              </label>
              <label className="contact-field">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email *"
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="contact-field">
              <span className="sr-only">Phone</span>
              <input
                type="tel"
                name="phone"
                placeholder="Phone (Optional)"
                autoComplete="tel"
              />
            </label>

            <label className="contact-field contact-field-area">
              <span className="sr-only">Tell us about your project</span>
              <textarea
                name="project"
                required
                rows={6}
                placeholder="Tell us about your project *"
              />
            </label>

            <fieldset className="contact-fieldset">
              <legend>SERVICES ARE INTERESTED IN</legend>
              <div className="contact-services">
                {SERVICE_OPTIONS.map((label) => {
                  const checked = services.includes(label);
                  return (
                    <label
                      key={label}
                      className={`contact-check ${checked ? "is-on" : ""}`}
                    >
                      <input
                        type="checkbox"
                        name="services"
                        value={label}
                        checked={checked}
                        onChange={() => toggleService(label)}
                      />
                      <span className="contact-check-dot" aria-hidden="true" />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="contact-fieldset">
              <legend>YOUR BUDGET</legend>
              <div className="contact-budgets">
                {BUDGETS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`contact-budget ${budget === amount ? "is-on" : ""}`}
                    aria-pressed={budget === amount}
                    onClick={() =>
                      setBudget((prev) => (prev === amount ? null : amount))
                    }
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="contact-captcha">
              <div ref={turnstileRef} />
              {!TURNSTILE_SITE_KEY ? (
                <p className="contact-form-hint">
                  Captcha site key is missing.
                </p>
              ) : null}
            </div>

            {status === "ok" ? (
              <p className="contact-form-success" role="status">
                Thanks, we got your request and will be in touch soon.
              </p>
            ) : null}
            {status === "error" && errorMessage ? (
              <p className="contact-form-error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              data-magnetic
              className="contact-submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
