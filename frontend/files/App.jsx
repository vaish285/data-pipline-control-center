import { useState } from "react";
import { Icon } from "./components/ui";
import Overview from "./pages/Overview";
import PipelineRuns from "./pages/PipelineRuns";
import RejectedRecords from "./pages/RejectedRecords";
import DataExplorer from "./pages/DataExplorer";
import DataQuality from "./pages/DataQuality";
import RunPipeline from "./pages/RunPipeline";

const NAV = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "runs", label: "Pipeline Runs", icon: "runs" },
  { id: "rejected", label: "Rejected Records", icon: "rejected" },
  { id: "explorer", label: "Data Explorer", icon: "explorer" },
  { id: "quality", label: "Data Quality", icon: "quality" },
  { id: "run", label: "Run Pipeline", icon: "play" },
];

export default function App() {
  const [page, setPage] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [version, setVersion] = useState(0); // bump to refetch all data
  const bump = () => setVersion((v) => v + 1);

  const go = (id) => { setPage(id); setMenuOpen(false); };

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo"><Icon name="runs" size={18} /></div>
          <div>
            <strong>Pipeline</strong>
            <span>Control Center</span>
          </div>
        </div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={page === n.id ? "active" : ""} onClick={() => go(n.id)}>
              <Icon name={n.icon} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot"><i /> API · 127.0.0.1:8000</div>
      </aside>
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <div className="main">
        <div className="topbar">
          <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <strong>Pipeline Control Center</strong>
        </div>
        <main className="content" key={page}>
          {page === "overview" && <Overview version={version} />}
          {page === "runs" && <PipelineRuns version={version} />}
          {page === "rejected" && <RejectedRecords version={version} />}
          {page === "explorer" && <DataExplorer version={version} />}
          {page === "quality" && <DataQuality version={version} />}
          {page === "run" && <RunPipeline onSuccess={bump} />}
        </main>
      </div>
    </div>
  );
}
