import type { Metadata } from "next";
import { pageMeta } from "../site";
import { Footer } from "../ui/Footer";

export const metadata: Metadata = pageMeta({ title: "Credits", description: "Licences for the textures and lighting used to build the Piermont studio.", path: "/credits" });

const ASSETS = [
  { asset: "Concrete034 (walls, floor)", author: "ambientCG", licence: "CC0 1.0", url: "https://ambientcg.com/view?id=Concrete034" },
  { asset: "Plaster003 (gallery walls)", author: "ambientCG", licence: "CC0 1.0", url: "https://ambientcg.com/view?id=Plaster003" },
  { asset: "Studio Small 09 (lighting HDRI)", author: "Poly Haven", licence: "CC0 1.0", url: "https://polyhaven.com/a/studio_small_09" },
];

export default function Credits() {
  return (
    <>
      <main id="main" className="room credits">
        <section className="desk-hero">
          <p className="k-kicker">Colophon</p>
          <h1 className="k-punch">Credits.</h1>
          <p className="desk-lede">Every exhibit in this building is Piermont work. The building itself borrows a few free materials, listed here with thanks.</p>
        </section>
        <section className="desk-lines">
          {ASSETS.map((a) => (
            <a key={a.asset} href={a.url} target="_blank" rel="noopener noreferrer" className="k-card desk-line">
              <span className="k-kicker">{a.author} · {a.licence}</span>{a.asset}
            </a>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
