"use client";

import { type CSSProperties, useEffect, useRef } from "react";

type LazyVideoProps = {
  src: string;
  className?: string;
  poster?: string;
  style?: CSSProperties;
};

/**
 * Muted looping background video that only downloads once it nears the
 * viewport and pauses when offscreen. Reduced-motion users get the first
 * frame, no playback.
 */
export function LazyVideo({ src, className, poster, style }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.dataset.loaded) {
            video.dataset.loaded = "true";
            video.src = reduce ? `${src}#t=0.1` : src;
            video.load();
          }
          if (!reduce) void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      style={style}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
    />
  );
}
