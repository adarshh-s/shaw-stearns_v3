import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Cell, Label, Reveal, reduceMotion } from "../components/ui.jsx";
import Footer from "../components/Footer.jsx";
import { SERVICES, DIFFERENCE, SECTORS } from "../content.js";

/* Abstract line glyphs, one per discipline */
const GLYPHS = {
  pm: (
    <svg className="cell__glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M2 50h60" />
      <g className="spin"><rect x="20" y="20" width="24" height="24" /><rect className="a" x="26" y="26" width="12" height="12" /></g>
      <path d="M8 50V40M20 50V34M44 50V34M56 50V24" strokeOpacity=".5" />
    </svg>
  ),
  cm: (
    <svg className="cell__glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M2 62h60M2 2v60" strokeOpacity=".5" />
      <rect x="10" y="38" width="8" height="24" /><rect x="24" y="28" width="8" height="34" />
      <rect x="38" y="18" width="8" height="44" /><rect className="a" x="52" y="10" width="8" height="52" />
    </svg>
  ),
  da: (
    <svg className="cell__glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M2 62h60" strokeOpacity=".5" />
      <path d="M4 56C18 54 24 44 32 34S48 14 60 8" />
      <path className="a" d="M4 56C22 52 30 48 38 40S52 26 60 22" strokeDasharray="2 3" />
      <circle className="a" cx="60" cy="8" r="2.5" />
    </svg>
  ),
};

/* Words light up one by one as the block scrolls through the viewport. */
const MANIFESTO = [
  ["We"], ["exist"], ["solely"], ["to"], ["protect"], ["owners"], ["and"], ["developers"], ["—"],
  ["their"], ["capital,", 1], ["their"], ["programme,", 1], ["their"], ["reputation.", 1],
  ["No"], ["contractors."], ["No"], ["suppliers."], ["No"], ["conflicts."],
];

function Manifesto() {
  const ref = useRef(null);
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = reduceMotion() ? 1 : Math.max(0, Math.min(1, p));
      setLit(Math.round(p * MANIFESTO.length));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <p className="manifesto__text" ref={ref}>
      {MANIFESTO.map(([w, acc], i) => (
        <span key={i}>
          <span className={`w${acc ? " acc" : ""}${i < lit ? " on" : ""}`}>{w}</span>{" "}
        </span>
      ))}
    </p>
  );
}

export default function Home() {
  return (
    <>
      <main id="main">
        <section className="hero" data-hero>
          <div className="wrap hero__body">
            <Label text="Independent Client-Side Advisors" box />
            <h1 className="hero__title">
              <span className="ln"><span>Peace of mind,</span></span>
              <span className="ln"><span className="silver">delivered.</span></span>
            </h1>
            <p className="hero__lede">
              <b>Project management, cost management and development advisory</b> for owners and developers,
              across the UAE and beyond.
            </p>
            <div className="hero__cta">
              <Link to="/contact" className="btn">
                Request a confidential discussion <ArrowUpRight />
              </Link>
              <Link to="/services" className="link">Explore services</Link>
            </div>
          </div>
          <div className="wrap">
            <div className="rail">
              {SERVICES.map((s) => (
                <Link key={s.id} to={`/services#${s.id}`}>
                  <small>{s.num}</small>
                  {s.short}
                </Link>
              ))}
              <span className="scroll-cue">Scroll <i /></span>
            </div>
          </div>
        </section>

        <section className="manifesto stage" aria-label="Manifesto">
          <div className="wrap manifesto__grid">
            <div><Label num="00" text="Manifesto" /></div>
            <div>
              <Manifesto />
              <Reveal className="manifesto__tags">
                <span className="chip">Independent</span>
                <span className="chip">Client-side</span>
                <span className="chip">Uncompromising</span>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="svc-title">
          <div className="wrap">
            <div className="section__head">
              <div>
                <Label num="01" text="Services" />
                <Reveal as="h2" className="h2" id="svc-title">
                  Three disciplines.<br /><span className="muted">One point of accountability.</span>
                </Reveal>
              </div>
              <Reveal as="p" delay={1}>Senior oversight on every assignment, from first feasibility to final account.</Reveal>
            </div>
            <Reveal className="cells cells--3">
              {SERVICES.map((s) => (
                <Cell as={Link} key={s.id} to={`/services#${s.id}`} className="cell--svc">
                  <span className="cell__num"><em>{s.num}</em> / 03</span>
                  {GLYPHS[s.id]}
                  <h3 className="cell__title">{s.title}</h3>
                  <p className="cell__text">{s.line}</p>
                  <span className="cell__foot">Explore <ArrowUpRight /></span>
                </Cell>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="diff-title" style={{ paddingTop: 24 }}>
          <div className="wrap">
            <div className="section__head">
              <div>
                <Label num="02" text="The difference" />
                <Reveal as="h2" className="h2" id="diff-title">
                  Why clients<br /><span className="muted">choose us.</span>
                </Reveal>
              </div>
            </div>
            <Reveal className="cells cells--4">
              {DIFFERENCE.map((d, i) => (
                <Cell key={d.title}>
                  <span className="cell__num"><em>0{i + 1}</em></span>
                  <h3 className="cell__title" style={{ marginTop: 56 }}>{d.title}</h3>
                  <p className="cell__text">{d.text}</p>
                </Cell>
              ))}
            </Reveal>
            <div className="marquee" aria-label={`Sectors: ${SECTORS.join(", ")}`}>
              <div className="marquee__track" aria-hidden="true">
                {[...SECTORS, ...SECTORS, ...SECTORS, ...SECTORS].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
