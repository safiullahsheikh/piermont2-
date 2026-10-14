import type { Metadata } from "next";
import Link from "next/link";
import { FEATURED } from "./content/featured";
import { projectsIn, WINGS } from "./content/wings";
import { ORGANIZATION_LD } from "./site";
import { Collection } from "./ui/Collection";
import { Footer } from "./ui/Footer";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const pad = (n: number) => String(n).padStart(2, "0");

export default function Atrium() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD).replace(/</g, "\\u003c") }} />
      <main id="main" className="room atr">
        {/* 0 · Hero */}
        <section className="atr-hero" data-station aria-labelledby="atr-title">
          <p className="k-kicker atr-kicker">Piermont Studios · Stage 01 · Sheridan / London</p>
          <h1 id="atr-title" className="atr-title">
            <span className="atr-word">PIERMONT</span>
            <span className="atr-punch">Look closer. It&rsquo;s all ours.</span>
          </h1>
          <p className="atr-lede">
            A creative studio for brands, products and campaigns. Every piece in this building is work we made.
          </p>
          <p className="atr-cue" aria-hidden="true"><span>Scroll to walk in</span></p>
        </section>

        {/* 1 · Manifesto */}
        <section className="atr-manifesto" data-station aria-label="Manifesto">
          <p className="k-kicker" data-reveal>House rules</p>
          <ol className="atr-rules">
            <li data-reveal><span>01</span>Strategy you can stand in front of.</li>
            <li data-reveal><span>02</span>Design that holds a wall.</li>
            <li data-reveal><span>03</span>Code that never creaks.</li>
          </ol>
        </section>

        {/* 2–7 · Out of the light: one featured piece per wing, rising from the Lightbox */}
        {FEATURED.map((f, i) => (
          <section key={f.slug} id={`piece-${i + 1}`} className="atr-piece" data-station aria-labelledby={`piece-${i + 1}-t`}>
            <article className="atr-label k-card" data-reveal>
              <p className="k-kicker">{i === 0 ? "Out of the light · " : ""}No. {pad(i + 1)} / {pad(FEATURED.length)} · {f.wing.title}</p>
              <h2 id={`piece-${i + 1}-t`} className="atr-client">{f.client}</h2>
              <p className="atr-tagline">{f.tagline}</p>
              <dl className="atr-meta">
                <div><dt>Medium</dt><dd>{f.service}</dd></div>
                <div><dt>Field</dt><dd>{f.category}</dd></div>
              </dl>
              <div className="atr-actions">
                <Link href={`/work/${f.slug}`} className="k-btn k-btn--accent" data-magnetic>View the exhibit</Link>
                <nav className="atr-step" aria-label="Featured pieces">
                  <a href={`#piece-${i}`} className="k-icon" aria-label="Previous piece" aria-disabled={i === 0 || undefined} tabIndex={i === 0 ? -1 : undefined}>←</a>
                  <a href={`#piece-${i + 2}`} className="k-icon" aria-label="Next piece" aria-disabled={i === FEATURED.length - 1 || undefined} tabIndex={i === FEATURED.length - 1 ? -1 : undefined}>→</a>
                </nav>
              </div>
            </article>
          </section>
        ))}

        {/* 8 · The wings, as a bento */}
        <section className="atr-wings" data-station aria-labelledby="atr-wings-t">
          <header className="atr-head" data-reveal>
            <p className="k-kicker">The wings</p>
            <h2 id="atr-wings-t" className="k-punch">Every discipline, framed.</h2>
          </header>
          <ul className="bento">
            {WINGS.map((w, i) => (
              <li key={w.slug} className={`bento-tile${i === 0 || i === 3 ? " bento-tile--wide" : ""}`} data-reveal>
                <Link href={`/services/${w.slug}`} className="bento-link">
                  <span className="bento-no">Wing {pad(i + 1)} · {pad(projectsIn(w).length)} works</span>
                  <span className="bento-title">{w.title}</span>
                  <span className="bento-punch">{w.punch}</span>
                  <span className="bento-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
            <li className="bento-tile bento-tile--accent" data-reveal>
              <Link href="/studio" className="bento-link">
                <span className="bento-no">Room 05</span>
                <span className="bento-title">The Workshop</span>
                <span className="bento-punch">Where the work gets its nerve.</span>
                <span className="bento-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
            <li className="bento-tile bento-tile--dark" data-reveal>
              <Link href="/journal" className="bento-link">
                <span className="bento-no">Room 06</span>
                <span className="bento-title">Reading Room</span>
                <span className="bento-punch">Notes from the studio floor.</span>
                <span className="bento-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </section>

        {/* 9 · The Collection */}
        <section className="atr-collection" data-station aria-labelledby="atr-col-t">
          <header className="atr-head" data-reveal>
            <p className="k-kicker">The permanent collection</p>
            <h2 id="atr-col-t" className="k-punch">Hung in good company.</h2>
          </header>
          <Collection />
        </section>

        {/* 10 · Call */}
        <section className="atr-call" data-station aria-labelledby="atr-call-t">
          <p className="k-kicker" data-reveal>Next room</p>
          <h2 id="atr-call-t" className="atr-call-title" data-reveal>The empty wall<br />is yours.</h2>
          <Link href="/contact" className="k-btn k-btn--accent k-btn--lg" data-magnetic data-reveal>Start a project</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
