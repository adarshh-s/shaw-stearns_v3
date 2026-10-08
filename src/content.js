// All site copy in one place — tightened from shawstearns.com.

export const NAV = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

export const CONTACT = {
  email: "enquiries@shawstearns.com",
  office: "Office S05-104, Trade Centre First",
  city: "Dubai, United Arab Emirates",
};

export const SERVICES = [
  {
    id: "pm",
    num: "01",
    short: "Project Management",
    title: "Project Management",
    line: "End-to-end owner’s representation, from strategy to handover.",
    headline: "One accountable lead across the full project lifecycle.",
    chips: ["Client brief", "Feasibility & strategy", "Budgets & benchmarks", "Risk management", "Regulatory consents", "Team selection", "Programme & critical path", "Procurement & tender", "Contract administration", "Handover"],
  },
  {
    id: "cm",
    num: "02",
    short: "Cost Management",
    title: "Cost Management & Quantity Surveying",
    line: "Independent commercial control and final account certainty.",
    headline: "Commercial discipline grounded in RICS standards.",
    chips: ["Cost planning", "Design economics", "Value engineering", "Whole-life costing", "Cash-flow forecasting", "Interim valuations", "Cost reporting", "Cost-value reconciliation", "Final account"],
  },
  {
    id: "da",
    num: "03",
    short: "Development Advisory",
    title: "Development Advisory",
    line: "Feasibility, modelling and strategy before major commitments.",
    headline: "Commercially robust advice from the earliest stages.",
    chips: ["Feasibility studies", "Development appraisals", "Financial modelling", "Option analysis", "Strategic guidance"],
  },
];

export const DIFFERENCE = [
  { title: "Certainty", text: "Disciplined governance and senior oversight that prevent overruns and disputes." },
  { title: "Independence", text: "We work only for you. No interests in the delivery supply chain." },
  { title: "Regulatory clarity", text: "Authority and stakeholder requirements navigated with precision." },
  { title: "Chartered leadership", text: "Led by Chartered Surveyors and Construction Managers." },
];

export const SECTORS = ["Corporate Real Estate", "Retail", "Hospitality", "Mixed-Use", "Healthcare", "Defence"];

export const VALUES = [
  { title: "Independence", text: "Exclusive loyalty to the client. No supply-chain conflicts." },
  { title: "Rigour", text: "Disciplined commercial control and senior oversight on every project." },
  { title: "Integrity", text: "Honesty and transparency in all dealings." },
  { title: "Excellence", text: "The highest professional standards, continuously raised." },
  { title: "Progress", text: "Building people and practice to operate at international level." },
];

export const METHOD = [
  { t: "Initiation", r: "RIBA Stage 0 — Strategic Definition",
    b: ["Set objectives, success criteria and stakeholder alignment", "Initial feasibility, risk identification and high-level cost advice", "Agree governance, approval gateways and protocols"],
    o: "Investment protected and direction locked before significant spend." },
  { t: "Communication", r: "RIBA Stage 1 — Preparation & Briefing",
    b: ["Define workflows, site investigation and procurement route", "Formal communication channels and staged approvals", "Initial cost plan and budget framework to RICS standards"],
    o: "Ambiguity removed. Early cost intelligence secured." },
  { t: "Programme", r: "RIBA Stages 1–2 — Programme & Value",
    b: ["Master programme with agreed key milestones", "Value engineering embedded early", "Formal cost plans updated at each gateway"],
    o: "Realistic timelines and full commercial visibility." },
  { t: "Cost", r: "RIBA Stages 2–4 — Budget Certainty",
    b: ["Scope defined and signed off with cost validation", "Cost Plans 1, 2 and 3 at each design stage", "Live cost monitoring and risk allowance management"],
    o: "Budgets locked with precision at every critical stage." },
  { t: "Design", r: "RIBA Stages 2–4 — Design & Cost Integration",
    b: ["Continuous cost review and benchmarking", "Design-to-cost discipline and price negotiation", "Design information coordinated to tender standard"],
    o: "Designs stay affordable. Budget integrity protected." },
  { t: "Procurement", r: "RIBA Stages 4–5 — Strategy & Tendering",
    b: ["Procurement strategy, tender documents and risk allocation", "Pre-tender estimate and cost check", "Tender management, evaluation and change control"],
    o: "Competitive tenders, clear risk allocation, variations minimised." },
  { t: "Construction", r: "RIBA Stage 5 — Construction Control",
    b: ["Real-time cost monitoring and interim valuations", "Strict change and variation management", "Regular cost reports and risk reviews"],
    o: "A predictable construction phase with full client visibility." },
  { t: "Handover", r: "RIBA Stages 6–7 — Completion & Final Account",
    b: ["Final Account prepared, negotiated and certified", "All handover documents, as-builts and manuals secured", "Close-out review and lessons learned"],
    o: "Commercially closed with zero outstanding liabilities." },
];
