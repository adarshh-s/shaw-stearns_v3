import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { createLiquid } from "../lib/liquid.js";

/**
 * Fixed full-screen liquid surface. Mounted once in the layout so it flows
 * uninterrupted between pages. It fades out as the page hero ([data-hero])
 * scrolls away and rises again as the footer CTA arrives.
 */
export default function Liquid() {
  const hostRef = useRef(null);
  const visible = useRef(true);
  const engine = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    engine.current = createLiquid(hostRef.current, () => visible.current);
    return () => engine.current?.destroy();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const update = () => {
      const vh = window.innerHeight;
      const hero = document.querySelector("[data-hero]");
      const footer = document.querySelector(".site-footer:not(.site-footer--compact)");
      const h = hero ? hero.offsetHeight : vh;
      const y = window.scrollY;
      const start = h * 0.35, end = h * 1.05;
      let o = 1 - Math.min(1, Math.max(0, (y - start) / (end - start)));
      if (footer) {
        const top = footer.getBoundingClientRect().top;
        o = Math.max(o, Math.min(1, Math.max(0, (vh - top) / (vh * 0.8))) * 0.6);
      }
      host.style.opacity = o.toFixed(3);
      const vis = o > 0.002;
      if (vis !== visible.current) {
        visible.current = vis;
        if (vis) engine.current?.wake();
      }
    };
    // wait a frame so the new page is laid out
    const raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <div className="liquid" ref={hostRef} aria-hidden="true">
      <canvas />
    </div>
  );
}
