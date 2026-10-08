import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, DubaiClock } from "./ui.jsx";
import { LogoMark, LogoWord } from "./Logo.jsx";
import { NAV, CONTACT } from "../content.js";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="nav__bar">
          <Link to="/" className="brand" aria-label="Shaw Stearns, home">
            <LogoMark className="brand__mark" />
            <span className="brand__text">
              <LogoWord className="brand__name" />
              <span className="brand__desc">Client-Side Advisors</span>
            </span>
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav__right">
            <span className="nav__clock">
              <i />
              Dubai <DubaiClock />
            </span>
            <Link to="/contact" className="btn btn--sm">
              Enquire <ArrowUpRight />
            </Link>
            <button
              className="nav__burger"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mmenu"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="mmenu" id="mmenu" aria-hidden={!open}>
        <nav aria-label="Mobile">
          {[{ to: "/", label: "Home" }, ...NAV].map((n, i) => (
            <Link key={n.to} to={n.to} tabIndex={open ? 0 : -1}>
              <small>0{i + 1}</small>
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="mmenu__foot">
          {CONTACT.email}
          <br />
          {CONTACT.city}
        </p>
      </div>
    </>
  );
}
