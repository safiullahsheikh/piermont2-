import Image from "next/image";
import { TESTIMONIALS } from "../content/testimonials";

const COVERS = [
  "Amber Olafsson Cover copy", "Ashley Anderson Cover copy", "Barry Money  Cover", "Bruna Rossana Cover", "Caridad Cover copy",
  "Chef Mercedes Cover copy", "Debbie Morrison Cover copy", "Jose rangel Cover copy", "Manuel Pelaz Prada Cover copy", "Marc Lambert Cover copy",
  "Paul Kohler Cover copy", "Rienzzie Kern Cover copy", "Ryan Pruiit Cover", "Stephen Siano Cover copy", "james Cover copy",
].map((f) => ({ src: `/TestimonialImages/${encodeURIComponent(f)}.png`, name: f.replace(/ +Cover.*/, "") }));

const Stars = () => <span className="voice-stars" aria-label="Five stars">★★★★★</span>;

/** What clients say: four quotes, then a reel of the people behind them. */
export function Voices() {
  return (
    <>
      <ul className="voices">
        {TESTIMONIALS.map((t) => (
          <li key={t.name} className="voice" data-reveal>
            <Stars />
            <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
            <p className="voice-by">
              <Image src={t.avatar} alt="" width={44} height={44} />
              <span><b>{t.name}</b>{t.company}</span>
            </p>
          </li>
        ))}
      </ul>
      <div className="covers" aria-label="Client stories">
        <div className="covers-track">
          {[0, 1].map((k) => (
            <ul key={k} className="covers-set" aria-hidden={k === 1 || undefined}>
              {COVERS.map((c) => (
                <li key={c.name} className="cover">
                  <Image src={c.src} alt={k === 0 ? `${c.name}, client story` : ""} width={320} height={180} sizes="320px" />
                  <span>{c.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </>
  );
}
