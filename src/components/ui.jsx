import { useEffect, useRef, useState, useCallback } from "react";

export const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ icons */

export function ArrowUpRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/* ------------------------------------------------------- in-view observer */

export function useInView(options = { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { setInView(true); io.disconnect(); }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView];
}

/** Fades and lifts its children in when scrolled into view. */
export function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const [ref, inView] = useInView();
  const d = delay ? ` rv-d${delay}` : "";
  return (
    <Tag ref={ref} className={`rv${d}${inView ? " in" : ""} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------ scramble */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#+-";

/** Text that resolves out of random glyphs the first time it enters view. */
export function Scramble({ text, as: Tag = "span", className, ...rest }) {
  const [ref, inView] = useInView();
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!inView || reduceMotion()) { setOut(text); return; }
    let frame = 0, raf = 0;
    const total = 22;
    const step = () => {
      frame++;
      const p = frame / total;
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        s += ch === " " || i / text.length < p ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(frame < total ? s : text);
      if (frame < total) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, text]);
  return (
    <Tag ref={ref} className={className} aria-label={text} {...rest}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  );
}

/** Mono section label: "01 / Services" */
export function Label({ num, text, box, className = "" }) {
  return (
    <span className={`label${box ? " label--box" : ""} ${className}`.trim()}>
      {num && <em>{num} /</em>}
      <Scramble text={text} />
    </span>
  );
}

/* ------------------------------------------------------- spotlight cell */

/** A grid cell with a cursor-following glow and micro-grid. Renders `as` (div, Link, a…). */
export function Cell({ as: Tag = "div", className = "", children, ...rest }) {
  const onMove = useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
  return (
    <Tag className={`cell ${className}`.trim()} onPointerMove={onMove} {...rest}>
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------- clock */

let fmt;
try {
  fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
} catch {
  fmt = null;
}

export function DubaiClock() {
  const [now, setNow] = useState(() => (fmt ? fmt.format(new Date()) : ""));
  useEffect(() => {
    if (!fmt) return;
    const id = setInterval(() => setNow(fmt.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <b>{now}</b>;
}

/* ---------------------------------------------------------------- tabs */

/**
 * Accessible tab state with roving focus and arrow-key navigation.
 * Returns [index, setIndex, getTabProps(i)].
 */
export function useTabs(count, initial = 0, { hoverSelect = false } = {}) {
  const [index, setIndex] = useState(initial);
  const refs = useRef([]);
  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const getTabProps = (i, id) => ({
    role: "tab",
    id: id ? `${id}-tab-${i}` : undefined,
    "aria-controls": id ? `${id}-panel` : undefined,
    "aria-selected": index === i,
    tabIndex: index === i ? 0 : -1,
    ref: (el) => (refs.current[i] = el),
    onClick: () => setIndex(i),
    onMouseEnter: hoverSelect && canHover ? () => setIndex(i) : undefined,
    onKeyDown: (e) => {
      const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next = null;
      if (e.key in map) next = (i + map[e.key] + count) % count;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = count - 1;
      if (next !== null) {
        e.preventDefault();
        setIndex(next);
        refs.current[next]?.focus();
      }
    },
  });

  return [index, setIndex, getTabProps];
}
