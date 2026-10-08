import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Label, Reveal, useTabs } from "../components/ui.jsx";
import Footer from "../components/Footer.jsx";
import { SERVICES, METHOD } from "../content.js";

function Disciplines() {
  const { hash } = useLocation();
  const [index, setIndex, tabProps] = useTabs(SERVICES.length, 0, { hoverSelect: true });

  // deep-link: /services#cm opens Cost Management and scrolls to it
  useEffect(() => {
    const i = SERVICES.findIndex((s) => `#${s.id}` === hash);
    if (i < 0) return;
    setIndex(i);
    document.getElementById("disciplines")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hash, setIndex]);

  const s = SERVICES[index];
  return (
    <Reveal className="disc" id="disciplines">
      <div className="disc__tabs" role="tablist" aria-label="Disciplines" aria-orientation="vertical">
        {SERVICES.map((x, i) => (
          <button key={x.id} className="disc__tab" {...tabProps(i, "disc")}>
            <span className="n">{x.num}</span>
            <span className="t">{x.title}</span>
            <ArrowRight />
          </button>
        ))}
      </div>
      <div className="disc__panel is-in" key={s.id} role="tabpanel" id="disc-panel" aria-labelledby={`disc-tab-${index}`}>
        <p className="kicker">{s.num} / {s.short}</p>
        <h3>{s.headline}</h3>
        <div className="chips">
          {s.chips.map((c) => <span className="chip" key={c}>{c}</span>)}
        </div>
      </div>
    </Reveal>
  );
}

function Methodology() {
  const [index, , tabProps] = useTabs(METHOD.length, 0, { hoverSelect: true });
  const s = METHOD[index];
  return (
    <Reveal className="method">
      <div className="method__track" role="tablist" aria-label="Methodology stages" style={{ "--i": index }}>
        <span className="method__fill" aria-hidden="true" />
        {METHOD.map((m, i) => (
          <button key={m.t} className={`method__step${i < index ? " done" : ""}`} {...tabProps(i, "method")}>
            <span className="n">0{i + 1}</span>
            <span className="dot" aria-hidden="true" />
            <span className="t">{m.t}</span>
          </button>
        ))}
      </div>
      <div className="method__panel is-in" key={index} role="tabpanel" id="method-panel" aria-labelledby={`method-tab-${index}`}>
        <div>
          <div className="method__big">0{index + 1}</div>
          <div>
            <h3>{s.t}</h3>
            <p className="riba">{s.r}</p>
          </div>
        </div>
        <ul>{s.b.map((b) => <li key={b}>{b}</li>)}</ul>
        <p className="out"><span>Outcome</span>{s.o}</p>
      </div>
    </Reveal>
  );
}

export default function Services() {
  return (
    <>
      <main id="main">
        <section className="hero hero--sub" data-hero>
          <div className="wrap hero__body">
            <Label text="How we work" box />
            <h1 className="hero__title">
              <span className="ln"><span>Discipline over cost,</span></span>
              <span className="ln"><span className="silver">programme and risk.</span></span>
            </h1>
            <p className="hero__lede">
              Complex projects demand rigorous control. We deliver it with <b>clarity, discipline and complete independence.</b>
            </p>
          </div>
        </section>

        <section className="section stage" aria-labelledby="disc-title" style={{ paddingTop: 64 }}>
          <div className="wrap">
            <div className="section__head">
              <div>
                <Label num="01" text="Disciplines" />
                <Reveal as="h2" className="h2" id="disc-title">
                  Three disciplines.<br /><span className="muted">One line of accountability.</span>
                </Reveal>
              </div>
            </div>
            <Disciplines />
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="method-title" style={{ paddingTop: 24 }}>
          <div className="wrap">
            <div className="section__head">
              <div>
                <Label num="02" text="Methodology" />
                <Reveal as="h2" className="h2" id="method-title">
                  Eight steps.<br /><span className="muted">Aligned to the RIBA Plan of Work.</span>
                </Reveal>
              </div>
              <Reveal as="p" delay={1}>Select a stage to see how we protect your project at each point in its lifecycle.</Reveal>
            </div>
            <Methodology />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
