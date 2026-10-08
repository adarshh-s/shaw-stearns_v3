import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Label, Reveal, reduceMotion } from "../components/ui.jsx";
import Footer from "../components/Footer.jsx";
import { VALUES } from "../content.js";

const NOTS = ["contractors.", "designers.", "suppliers."];

/* Each "We are not…" line is struck through as it passes the reading line. */
function NotList() {
  const refs = useRef([]);
  const [struck, setStruck] = useState([]);
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      setStruck(refs.current.map((el) => reduceMotion() || (el && el.getBoundingClientRect().top < vh * 0.62)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <ul className="nots__list">
      {NOTS.map((n, i) => (
        <li key={n} ref={(el) => (refs.current[i] = el)} className={struck[i] ? "on" : ""}>
          <span className="t">We are not {n}</span>
          <small>0{i + 1} / Conflict</small>
        </li>
      ))}
      <li className="yes">
        <span className="t">We work for <span className="silver">you.</span></span>
        <small>Zero competing interests</small>
      </li>
    </ul>
  );
}

export default function About() {
  const [openValue, setOpenValue] = useState(null);

  return (
    <>
      <main id="main">
        <section className="hero hero--sub" data-hero>
          <div className="wrap hero__body">
            <Label text="About the practice" box />
            <h1 className="hero__title">
              <span className="ln"><span>Independent.</span></span>
              <span className="ln"><span>Client-side.</span></span>
              <span className="ln"><span className="silver">Uncompromising.</span></span>
            </h1>
            <p className="hero__lede">
              A pure client-side boutique. We exist solely to protect the interests of <b>owners and developers.</b>
            </p>
          </div>
        </section>

        <section className="section stage" aria-label="Our position">
          <div className="wrap nots">
            <div><Label num="01" text="Position" /></div>
            <div>
              <NotList />
              <Reveal as="p" className="nots__note">
                When advisors have ties to contractors, suppliers or designers, their advice can be compromised.
                Ours has none. Led by Chartered Surveyors and Chartered Construction Managers, we bring senior
                oversight and clear governance to every assignment.
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="values-title" style={{ paddingTop: 24 }}>
          <div className="wrap">
            <div className="section__head">
              <div>
                <Label num="02" text="Principles" />
                <Reveal as="h2" className="h2" id="values-title">
                  Five principles.<br /><span className="muted">Every assignment.</span>
                </Reveal>
              </div>
            </div>

            <Reveal className="cells duo">
              <Cell>
                <span className="cell__num"><em>Mission</em></span>
                <h3 className="cell__title" style={{ marginTop: 18 }}>Protect capital, programme and reputation.</h3>
                <p className="cell__text">Through pure, independent client-side advice — and a practice of lasting international standing.</p>
              </Cell>
              <Cell>
                <span className="cell__num"><em>Ethos</em></span>
                <h3 className="cell__title" style={{ marginTop: 18 }}>Independence is our mandate.</h3>
                <p className="cell__text">Ambitious for the practice, but never at the expense of quality or independence.</p>
              </Cell>
            </Reveal>

            <Reveal className="cells cells--5 values" style={{ borderTop: 0 }}>
              {VALUES.map((v, i) => (
                <Cell
                  key={v.title}
                  className={openValue === i ? "open" : ""}
                  tabIndex={0}
                  onClick={() => setOpenValue(openValue === i ? null : i)}
                >
                  <span className="cell__idx" aria-hidden="true">0{i + 1}</span>
                  <span className="cell__num"><em>0{i + 1}</em> / 05</span>
                  <h3 className="cell__title">{v.title}</h3>
                  <p className="cell__text">{v.text}</p>
                </Cell>
              ))}
            </Reveal>

            <Reveal className="standards">
              <div><b>RICS</b><span>Royal Institution of<br />Chartered Surveyors</span></div>
              <div><b>CIOB</b><span>Chartered Institute<br />of Building</span></div>
              <p>
                All work is conducted to RICS and CIOB standards. Integrity, independence and professional conduct are
                non-negotiable. <br /><Link to="/services" className="link" style={{ marginTop: 14 }}>How we work</Link>
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
