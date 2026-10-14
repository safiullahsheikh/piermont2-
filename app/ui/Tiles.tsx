import Image from "next/image";
import Link from "next/link";
import { LazyVideo } from "../components/LazyVideo";
import { postMedia, type Post } from "../content/posts";
import type { Project } from "../content/projects";

/** A project as a tile: still, with the loop playing over it, client and discipline under a hairline. */
export function ProjectTile({ p, size = "", sizes = "(max-width: 760px) 100vw, 33vw", screen = true }: { p: Project; size?: string; sizes?: string; screen?: boolean }) {
  return (
    <Link href={`/work/${p.slug}`} className={`tile ${size}`} data-screen={screen && p.video ? p.video : undefined} data-reveal>
      <span className="tile-media">
        <Image src={p.image} alt={p.alt} fill sizes={sizes} style={{ objectPosition: p.focus }} />
        {p.video && <LazyVideo src={p.video} className="tile-video" style={{ objectPosition: p.focus }} />}
      </span>
      <span className="tile-cap">
        <span className="tile-client">{p.client}</span>
        <span className="tile-meta">{p.group.toLowerCase()}</span>
      </span>
      <span className="tile-line">{p.tagline}</span>
      <span className="tile-arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

export function PostCard({ post, lead = false }: { post: Post; lead?: boolean }) {
  const m = postMedia(post);
  return (
    <Link href={`/journal/${post.slug}`} className={`post${lead ? " post--lead" : ""}`} data-reveal>
      <span className="post-media">
        <Image src={m.poster} alt={m.alt} fill sizes={lead ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 100vw, 25vw"} />
        {lead && m.video && <LazyVideo src={m.video} className="tile-video" />}
      </span>
      <span className="post-meta">{post.category} · {post.date} · {post.readTime}</span>
      <span className="post-title">{post.title}</span>
      {lead && <span className="post-excerpt">{post.excerpt}</span>}
    </Link>
  );
}
