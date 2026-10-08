import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Liquid from "./components/Liquid.jsx";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Contact from "./pages/Contact.jsx";

const TITLES = {
  "/": "Shaw Stearns — Independent Client-Side Advisors",
  "/about": "About — Shaw Stearns",
  "/services": "Services — Shaw Stearns",
  "/contact": "Contact — Shaw Stearns",
};

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] || TITLES["/"];
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <RouteEffects />
      <Liquid />
      <div className="grain" aria-hidden="true" />
      <div className="gridlines" aria-hidden="true">
        <div className="wrap"><span /><span /><span /><span /></div>
      </div>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
