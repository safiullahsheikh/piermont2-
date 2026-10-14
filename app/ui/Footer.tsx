import Image from "next/image";
import Link from "next/link";
import { SCENES, NAV } from "../gallery/plan";
import { WINGS } from "../content/wings";
import { EMAIL, LOCATIONS, PHONE, REVIEWS, SOCIALS } from "../site";

/** Every page ends here: the call, the signature, every way to reach us. */
export function Footer() {
  return (
    <footer className="foot">
      <section className="foot-call" data-reveal>
        <p className="kicker">Got something in mind?</p>
        <p className="foot-punch">Let&rsquo;s build the next thing people talk about.</p>
        <div className="foot-actions">
          <Link href="/contact" className="btn btn--accent">Start a project</Link>
          <a href={`mailto:${EMAIL}`} className="btn">{EMAIL}</a>
        </div>
      </section>

      <div className="foot-grid">
        <nav aria-labelledby="foot-pages">
          <h2 id="foot-pages" className="kicker">Pages</h2>
          <ul>{NAV.map((id) => <li key={id}><Link href={SCENES[id].href}>{SCENES[id].label}</Link></li>)}</ul>
        </nav>
        <nav aria-labelledby="foot-services">
          <h2 id="foot-services" className="kicker">Services</h2>
          <ul>{WINGS.map((w) => <li key={w.slug}><Link href={`/services/${w.slug}`}>{w.title}</Link></li>)}</ul>
        </nav>
        {LOCATIONS.map((l) => (
          <section key={l.country} aria-label={`${l.country} office`}>
            <h2 className="kicker">{l.country} office</h2>
            <address>
              <b>{l.city}</b>
              <span>{l.street}</span>
              <span>{l.locality}{l.region ? `, ${l.region}` : ""} {l.postalCode}</span>
            </address>
          </section>
        ))}
        <section aria-label="Contact">
          <h2 className="kicker">Talk to us</h2>
          <a href={PHONE.href} className="foot-line">{PHONE.display}</a>
          <a href={`mailto:${EMAIL}`} className="foot-line">{EMAIL}</a>
          <p className="foot-socials">
            {SOCIALS.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="chip">{s.label}</a>)}
          </p>
        </section>
      </div>

      <div className="foot-proof">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size badge artwork */}
        <img src="/OtherAssets/ClutchandGoogle.png" alt="Clutch Top 1000 Companies and Google 5 Star Customer Rating" className="foot-badge" loading="lazy" decoding="async" />
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size badge artwork */}
        <img src="/OtherAssets/Trustpilot.png" alt="Trustpilot rating" className="foot-badge foot-badge--tp" loading="lazy" decoding="async" />
        <ul className="foot-reviews">
          {REVIEWS.map((r) => {
            // eslint-disable-next-line @next/next/no-img-element -- 28px review-site icons
            const icon = <img src={r.icon} alt="" width={28} height={28} loading="lazy" decoding="async" />;
            return (
              <li key={r.label}>
                {r.href
                  ? <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={`Piermont Studios on ${r.label}`} title={r.label}>{icon}</a>
                  : <span title={r.label} aria-label={r.label} role="img">{icon}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      <Image src="/logo-cream.png" alt="Piermont Studios" width={1316} height={552} className="foot-logo" sizes="(max-width: 900px) 90vw, 820px" />
      <div className="foot-base">
        <p>© 2026 Piermont Studios. All rights reserved.</p>
        <p><Link href="/credits">Credits</Link></p>
      </div>
    </footer>
  );
}
