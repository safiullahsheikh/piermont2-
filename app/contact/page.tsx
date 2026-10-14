import type { Metadata } from "next";
import { ContactSection } from "../components/ContactSection";
import { EMAIL, LOCATIONS, PHONE, pageMeta } from "../site";
import { Footer } from "../ui/Footer";

export const metadata: Metadata = pageMeta({
  title: "Contact Us for a Project Quote",
  description:
    "Request a quote from Piermont Studios for branding, website design, UI/UX, marketing or video. Offices in Sheridan, Wyoming and London.",
  path: "/contact",
});

export default function FrontDesk() {
  return (
    <>
      <main id="main" className="page desk">
        <section className="desk-hero" data-station aria-labelledby="desk-title">
          <p className="kicker">Contact</p>
          <h1 id="desk-title" className="h2 desk-title">Your piece<br />goes here.</h1>
          <p className="desk-lede">Tell us what you are making. A real person reads every slip and replies within one working day.</p>
        </section>
        <div data-station>
          <ContactSection />
        </div>
        <section className="desk-lines" data-station aria-label="Direct lines">
          <a href={`mailto:${EMAIL}`} className="desk-line"><span className="kicker">Email</span>{EMAIL}</a>
          <a href={PHONE.href} className="desk-line"><span className="kicker">Phone</span>{PHONE.display}</a>
          {LOCATIONS.map((l) => (
            <address key={l.country} className="desk-line"><span className="kicker">Branch · {l.country}</span>{l.address}</address>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
