import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LazyVideo } from "./components/LazyVideo";
import { FEATURED } from "./content/featured";
import { POSTS } from "./content/posts";
import { PROJECTS } from "./content/projects";
import { SERVICES } from "./content/services";
import { ORGANIZATION_LD } from "./site";
import { Collection } from "./ui/Collection";
import { Footer } from "./ui/Footer";
import { PostCard, ProjectTile } from "./ui/Tiles";
import { Voices } from "./ui/Voices";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const pad = (n: number) => String(n).padStart(2, "0");
const featured = new Set(FEATURED.map((f) => f.slug));
const MORE = PROJECTS.filter((p) => !featured.has(p.slug)).slice(0, 7);
const BENTO = ["tile--xl", "", "", "tile--tall", "tile--wide", "", ""];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD).replace(/</g, "\\u003c") }} />
      <main id="main" className="page home">
        {/* 0 · Hero: the headline on the left, the machine on the right, typing to itself */}
        <section className="hero" data-station aria-labelledby="hero-title">
          <p className="kicker hero-kicker"><span className="rec" aria-hidden="true" />Piermont Studios · Creative agency · Sheridan / London</p>
          <h1 id="hero-title" className="hero-title">
            <span className="line"><span>We strategize,</span></span>
            <span className="line"><span>build <em>&amp;</em> promote.</span></span>
          </h1>
          <p className="hero-lede">Brands, websites, products and campaigns for teams who&rsquo;d rather be remembered than merely seen.</p>
          <div className="hero-actions">
            <a href="#work" className="btn btn--accent">See the work</a>
            <Link href="/contact" className="btn">Start a project</Link>
          </div>
          <dl className="hero-stats">
            <div><dt>Projects shipped</dt><dd>{PROJECTS.length}+</dd></div>
            <div><dt>Disciplines</dt><dd>06</dd></div>
            <div><dt>Offices</dt><dd>US · UK</dd></div>
          </dl>
          <p className="hero-cue" aria-hidden="true">Scroll into the screen</p>
        </section>

        {/* 1 · Showreel: the camera goes through the glass */}
        <section className="reel" data-station data-screen="/video.mp4" aria-label="Showreel">
          <div className="reel-cap" data-reveal>
            <p className="kicker">Showreel · 2026</p>
            <p className="reel-title">Behind the pixels.</p>
          </div>
        </section>

        {/* 2–7 · Selected work: each project plays on the machine */}
        <div id="work" className="work">
          {FEATURED.map((f, i) => (
            <section key={f.slug} className="feat" data-station data-screen={f.video} aria-labelledby={`feat-${i}`}>
              <article className="feat-card" data-reveal>
                <p className="kicker">Selected work · {pad(i + 1)} / {pad(FEATURED.length)}</p>
                <h2 id={`feat-${i}`} className="feat-client">{f.client}</h2>
                <p className="feat-tagline">{f.tagline}</p>
                <p className="feat-intro">{f.intro.split(". ").slice(0, 2).join(". ")}.</p>
                <dl className="feat-meta">
                  <div><dt>Service</dt><dd>{f.wing.title}</dd></div>
                  <div><dt>Industry</dt><dd>{f.category}</dd></div>
                </dl>
                <Link href={`/work/${f.slug}`} className="btn btn--accent">View case study</Link>
              </article>
            </section>
          ))}
        </div>

        {/* 8 · More work: a bento of real projects, each playing on hover */}
        <section className="more" data-station aria-labelledby="more-title">
          <header className="head">
            <p className="kicker">The archive</p>
            <h2 id="more-title" className="h2">More from the studio.</h2>
            <Link href="/work" className="btn">All {PROJECTS.length} projects</Link>
          </header>
          <div className="bento">
            {MORE.map((p, i) => <ProjectTile key={p.slug} p={p} size={BENTO[i]} />)}
          </div>
        </section>

        {/* 9 · Services: six disciplines, each with its own loop */}
        <section className="svc" data-station aria-labelledby="svc-title">
          <header className="head">
            <p className="kicker">What we do</p>
            <h2 id="svc-title" className="h2">Six disciplines. One team.</h2>
            <Link href="/services" className="btn">All services</Link>
          </header>
          <ul className="svc-grid">
            {SERVICES.map((s) => (
              <li key={s.title} className="svc-card" data-reveal data-screen={s.video ?? undefined}>
                <span className="svc-media">
                  {s.video ? <LazyVideo src={s.video} className="tile-video is-on" /> : <Image src={s.image!} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />}
                </span>
                <span className="svc-top"><span className="kicker">{s.tag}</span><span className="svc-no">{s.index}</span></span>
                <h3 className="svc-title">{s.title}</h3>
                <p className="svc-desc">{s.descriptionLines.join(" ")}</p>
                <ul className="svc-items">{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </li>
            ))}
          </ul>
        </section>

        {/* 10 · Voices */}
        <section className="vox" data-station aria-labelledby="vox-title">
          <header className="head">
            <p className="kicker">Client voices</p>
            <h2 id="vox-title" className="h2">Five stars, in their words.</h2>
          </header>
          <Voices />
        </section>

        {/* 11 · Clients + journal */}
        <section className="cli" data-station aria-labelledby="cli-title">
          <header className="head">
            <p className="kicker">Trusted by teams at</p>
            <h2 id="cli-title" className="h2">Names you know.</h2>
          </header>
          <Collection />
          <header className="head head--journal">
            <p className="kicker">Journal</p>
            <h2 className="h2">Notes from the studio.</h2>
            <Link href="/journal" className="btn">Read the journal</Link>
          </header>
          <div className="posts">
            {POSTS.slice(0, 3).map((p, i) => <PostCard key={p.slug} post={p} lead={i === 0} />)}
          </div>
        </section>

        {/* 12 · Call */}
        <section className="call" data-station data-screen="/OtherAssets/contact.mp4" aria-labelledby="call-title">
          <p className="kicker">Your turn</p>
          <h2 id="call-title" className="call-title">Press any key<br />to begin.</h2>
          <Link href="/contact" className="btn btn--accent btn--lg">Start a project</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
