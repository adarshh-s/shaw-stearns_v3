import { Link } from "react-router-dom";
import { ArrowUpRight, Label, Reveal } from "./ui.jsx";
import { SERVICES, CONTACT } from "../content.js";
import { LogoMark, LogoWord } from "./Logo.jsx";

export default function Footer({ compact = false }) {
  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={`site-footer${compact ? " site-footer--compact" : ""}`}>
      <div className="wrap">
        {!compact && (
          <section className="cta" aria-labelledby="cta-title">
            <Label text="A limited number of clients" box />
            <Reveal as="h2" className="cta__title" id="cta-title">
              Protect your capital.
              <br />
              <span className="silver">Start with a conversation.</span>
            </Reveal>
            <Reveal className="cta__row" delay={1}>
              <p>We take on a limited number of clients. Let’s discuss whether Shaw Stearns is the right fit for your project.</p>
              <Link to="/contact" className="btn">
                Request a confidential discussion <ArrowUpRight />
              </Link>
            </Reveal>
          </section>
        )}

        <div className="fgrid">
          <div>
            <h4><em>01 /</em> Services</h4>
            <ul>
              {SERVICES.map((s) => (
                <li key={s.id}><Link to={`/services#${s.id}`}>{s.short}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4><em>02 /</em> Practice</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/contact#careers">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4><em>03 /</em> Office</h4>
            <ul>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><p>{CONTACT.office}<br />{CONTACT.city}</p></li>
            </ul>
          </div>
          <div>
            <h4><em>04 /</em> Record</h4>
            <p>© {new Date().getFullYear()} Shaw Stearns.<br />RICS &amp; CIOB standards.</p>
            <a href="#top" className="totop" onClick={toTop}>
              Top <ArrowUpRight width="12" height="12" style={{ transform: "rotate(-45deg)" }} />
            </a>
          </div>
        </div>

        <div className="wordmark" aria-hidden="true">
          <LogoWord className="wordmark__word" />
          <LogoMark className="wordmark__mark" />
        </div>
      </div>
    </footer>
  );
}
