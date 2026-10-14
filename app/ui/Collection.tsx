import { BRANDS } from "../site";

const pad = (n: number) => String(n).padStart(2, "0");

function Piece({ b, n }: { b: (typeof BRANDS)[number]; n: number }) {
  return (
    <figure className="col-piece">
      <div className="col-frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- small logo artwork, already sized */}
        <img src={`/brands/${b.slug}.png`} alt={b.name} loading="lazy" decoding="async" />
      </div>
      <figcaption className="col-label">No. {pad(n)} · {b.name}</figcaption>
    </figure>
  );
}

/**
 * The Collection: client logos hung as a small permanent collection, two rows travelling in
 * opposite directions. Each row's track is doubled so the loop is seamless.
 */
export function Collection({ rows = 2 }: { rows?: 1 | 2 }) {
  const half = Math.ceil(BRANDS.length / 2);
  const sets = rows === 2 ? [BRANDS.slice(0, half), BRANDS.slice(half)] : [BRANDS];
  return (
    <div className="col">
      {sets.map((set, r) => (
        <div key={r} className={`col-row${r % 2 ? " col-row--rev" : ""}`}>
          <div className="col-track">
            {[0, 1].map((k) => (
              <ul key={k} className="col-set" aria-hidden={k === 1 || undefined} aria-label={k === 0 ? "Clients in the collection" : undefined}>
                {set.map((b) => <li key={b.slug}><Piece b={b} n={BRANDS.indexOf(b) + 1} /></li>)}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
