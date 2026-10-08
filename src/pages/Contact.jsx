import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUpRight, Label, useTabs } from "../components/ui.jsx";
import Footer from "../components/Footer.jsx";
import { CONTACT } from "../content.js";

const MODES = [
  { id: "project", tab: "Project enquiry", subject: "Confidential discussion request" },
  { id: "careers", tab: "Join the practice", subject: "Careers enquiry" },
];

function Field({ name, label, type = "text", required, full, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className={`field${full ? " full" : ""}`}>
      <Tag id={name} name={name} type={textarea ? undefined : type} placeholder=" " required={required} data-label={label} />
      <label htmlFor={name}>{label}{required && <i> *</i>}</label>
    </div>
  );
}

function FileField({ name, label, required }) {
  const [file, setFile] = useState("");
  return (
    <div className="field field--file full">
      <span>{file || label}</span>
      <input id={name} name={name} type="file" accept=".pdf,.doc,.docx" required={required} onChange={(e) => setFile(e.target.files?.[0]?.name || "")} />
      <label htmlFor={name}>{file ? "Change" : "Attach"}</label>
    </div>
  );
}

export default function Contact() {
  const { hash } = useLocation();
  const [mode, setMode, tabProps] = useTabs(2, hash === "#careers" ? 1 : 0);
  const [done, setDone] = useState(false);
  const switchRef = useRef(null);
  const [pill, setPill] = useState({ width: 0, x: 0 });

  useEffect(() => { if (hash === "#careers") setMode(1); }, [hash, setMode]);

  // slide the switch highlight under the active tab
  useLayoutEffect(() => {
    const measure = () => {
      const btn = switchRef.current?.querySelectorAll('[role="tab"]')[mode];
      if (btn) setPill({ width: btn.offsetWidth, x: btn.offsetLeft });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mode]);

  // No backend yet: open an email to the practice, pre-filled with the form.
  const onSubmit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const lines = [];
    f.querySelectorAll("input:not([type=file]), textarea").forEach((el) => {
      if (el.value.trim()) lines.push(`${el.dataset.label}: ${el.value.trim()}`);
    });
    if ([...f.querySelectorAll("input[type=file]")].some((i) => i.files.length)) {
      lines.push("", "(Please attach your document to this email.)");
    }
    window.location.href =
      `mailto:${CONTACT.email}?subject=${encodeURIComponent(MODES[mode].subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setDone(true);
  };

  return (
    <>
      <main id="main">
        <section className="contact" data-hero>
          <div className="wrap">
            <div className="contact__grid">
              <div className="contact__info">
                <Label text="Start a conversation" box />
                <h1>Confidential<br /><span className="silver">by default.</span></h1>
                <p>Private discussions to explore whether Shaw Stearns is the right partner for your project.</p>
                <div className="contact__meta">
                  <div><span>Email</span><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
                  <div><span>Office</span><p>{CONTACT.office}<br />{CONTACT.city}</p></div>
                </div>
              </div>

              <div className={`form${done ? " is-done" : ""}`}>
                <div className="form__switch" role="tablist" aria-label="Enquiry type" ref={switchRef}>
                  <span className="pill" aria-hidden="true" style={{ width: pill.width, transform: `translateX(${pill.x}px)` }} />
                  {MODES.map((m, i) => (
                    <button key={m.id} {...tabProps(i, `form-${m.id}`)} aria-controls="enquiry-form">{m.tab}</button>
                  ))}
                </div>

                <form id="enquiry-form" onSubmit={onSubmit} key={mode}>
                  {mode === 0 ? (
                    <div className="form__grid">
                      <Field name="name" label="Full name" required />
                      <Field name="email" label="Email address" type="email" required />
                      <Field name="phone" label="Phone" type="tel" />
                      <Field name="company" label="Company" />
                      <Field name="project" label="Project type / location" full />
                      <Field name="brief" label="Brief description" textarea full />
                      <FileField name="rfp" label="Request for proposals (optional)" />
                    </div>
                  ) : (
                    <>
                      <p className="careers-note">
                        Chartered professionals and motivated graduates in project and cost management —
                        we review every application personally.
                      </p>
                      <div className="form__grid">
                        <Field name="name" label="Full name" required />
                        <Field name="email" label="Email address" type="email" required />
                        <Field name="phone" label="Phone" type="tel" required full />
                        <Field name="note" label="A short note about you" textarea full />
                        <FileField name="cv" label="Your CV (PDF or Word)" />
                      </div>
                    </>
                  )}
                  <div className="form__foot">
                    <p>Every enquiry is treated with full discretion.</p>
                    <button type="submit" className="btn">
                      {mode === 0 ? "Request a discussion" : "Send application"} <ArrowUpRight />
                    </button>
                  </div>
                </form>

                <div className="form__done" role="status">
                  <Label text="Draft ready" box />
                  <h3>Thank you.</h3>
                  <p>Your email app has opened with the details. Send it and we’ll be in touch.</p>
                  <button className="link" style={{ marginTop: 28 }} onClick={() => setDone(false)}>Back to form</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer compact />
    </>
  );
}
