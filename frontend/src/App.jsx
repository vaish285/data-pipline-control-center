import { useEffect, useState } from "react";
import Overview from "./Overview";
import PipelineRuns from "./PipelineRuns";
import RejectedRecords from "./RejectedRecords";
import DataExplorer from "./DataExplorer";
import DataQuality from "./DataQuality";
import RunPipeline from "./RunPipeline";
import { API_BASE } from "./api";
import { Icon } from "./ui";
import "./index.css";

const pages = {
  overview: Overview,
  runs: PipelineRuns,
  rejected: RejectedRecords,
  explorer: DataExplorer,
  quality: DataQuality,
  run: RunPipeline,
};

const navGroups = [
  { label: "Monitor", items: [
    ["overview", "Overview", "overview"],
    ["runs", "Pipeline Runs", "runs"],
    ["quality", "Data Quality", "quality"],
  ] },
  { label: "Data", items: [
    ["rejected", "Rejected Records", "rejected"],
    ["explorer", "Data Explorer", "explorer"],
  ] },
  { label: "Operate", items: [
    ["run", "Run Pipeline", "play"],
  ] },
];

const titles = Object.fromEntries(navGroups.flatMap((g) => g.items.map(([id, label]) => [id, label])));

const Mark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="5.5" cy="7" r="2" /><circle cx="18.5" cy="17" r="2" />
    <path d="M7.5 7H13a3 3 0 013 3v2a3 3 0 003 3" />
  </svg>
);

export default function App() {
  const [page, setPage] = useState("overview");
  const [version, setVersion] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const Page = pages[page];
  const go = (id) => { setPage(id); setMenuOpen(false); window.scrollTo({ top: 0 }); };
  const host = API_BASE.replace(/^https?:\/\//, "");

  useEffect(() => { document.title = `${titles[page]} · Pipeline Control Center`; }, [page]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo"><Mark /></div>
          <div>
            <h2>Pipeline</h2>
            <p>Control Center</p>
          </div>
        </div>

        <nav aria-label="Main navigation">
          {navGroups.map((g) => (
            <div className="nav-group" key={g.label}>
              <span className="nav-label">{g.label}</span>
              {g.items.map(([id, label, icon]) => (
                <button
                  key={id}
                  className={page === id ? "active" : ""}
                  aria-current={page === id ? "page" : undefined}
                  onClick={() => go(id)}
                >
                  <Icon name={icon} size={17} /> {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="foot-label">API endpoint</span>
          <span className="foot-host"><i /> {host}</span>
        </div>
      </aside>
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <Icon name="menu" />
          </button>
          <div className="crumbs">
            <span>Data Pipeline Control Center</span>
            <Icon name="arrow" size={12} />
            <strong>{titles[page]}</strong>
          </div>
          {page !== "run" && (
            <button className="btn btn-primary btn-sm topbar-cta" onClick={() => go("run")}>
              <Icon name="play" size={13} /> Run pipeline
            </button>
          )}
        </header>

        <section className="content" key={page}>
          {Page && (
            <Page
              version={version}
              navigate={go}
              onSuccess={() => setVersion((v) => v + 1)}
            />
          )}
        </section>
      </main>
    </div>
  );
}
