import Link from "next/link";
import { ROOM_ORDER, ROOMS } from "../gallery/plan";
import { EMAIL, LOCATIONS, PHONE, REVIEWS, SOCIALS } from "../site";

const pad = (n: number) => String(n).padStart(2, "0");

/** The neobrutalist footer every room ends on. */
export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-grid">
        <section className="foot-tile foot-cta" data-reveal>
          <p className="k-kicker">Commissions open</p>
          <p className="foot-punch">Your piece goes here.</p>
          <Link href="/contact" className="k-btn k-btn--accent" data-magnetic>Start a project</Link>
        </section>

        <section className="foot-tile foot-awards" aria-labelledby="foot-awards" data-reveal>
          <h2 id="foot-awards" className="k-kicker">Achievements</h2>
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
        </section>

        <nav className="foot-tile foot-rooms" aria-labelledby="foot-rooms" data-reveal>
          <h2 id="foot-rooms" className="k-kicker">The rooms</h2>
          <ul>
            {ROOM_ORDER.filter((id) => id !== "exhibit").map((id) => (
              <li key={id}><Link href={ROOMS[id].href}><span>{pad(ROOMS[id].no)}</span>{ROOMS[id].label}</Link></li>
            ))}
          </ul>
        </nav>

        {LOCATIONS.map((l) => (
          <section key={l.country} className="foot-tile foot-branch" aria-label={`${l.country} branch`} data-reveal>
            <p className="k-kicker">Branch · {l.country}</p>
            <address>
              <b>{l.city}</b>
              <span>{l.street}</span>
              <span>{l.locality}{l.region ? `, ${l.region}` : ""} {l.postalCode}</span>
              <span>{l.country === "USA" ? "United States" : "United Kingdom"}</span>
            </address>
          </section>
        ))}

        <section className="foot-tile foot-contact" aria-label="Contact" data-reveal>
          <p className="k-kicker">Front desk</p>
          <a href={PHONE.href} className="foot-line">{PHONE.display}</a>
          <a href={`mailto:${EMAIL}`} className="foot-line">{EMAIL}</a>
          <p className="foot-socials">
            {SOCIALS.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="k-chip">{s.label}</a>)}
          </p>
        </section>
      </div>

      <p className="foot-word" aria-hidden="true">PIERMONT</p>
      <div className="foot-base">
        <p>© 2026 Piermont Studios. All rights reserved.</p>
        <p><Link href="/credits">Credits</Link></p>
      </div>
    </footer>
  );
}
