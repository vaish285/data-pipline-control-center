import { useState } from "react";
import Overview from "./Overview";
import PipelineRuns from "./PipelineRuns";
import RejectedRecords from "./RejectedRecords";
import DataExplorer from "./DataExplorer";
import DataQuality from "./DataQuality";
import RunPipeline from "./RunPipeline";
import "./index.css";

const pages = {
  overview: Overview,
  runs: PipelineRuns,
  rejected: RejectedRecords,
  explorer: DataExplorer,
  quality: DataQuality,
  run: RunPipeline,
};

const navItems = [
  ["overview", "Overview"],
  ["runs", "Pipeline Runs"],
  ["rejected", "Rejected Records"],
  ["explorer", "Data Explorer"],
  ["quality", "Data Quality"],
  ["run", "Run Pipeline"],
];

export default function App() {
  const [page, setPage] = useState("overview");
  const [version, setVersion] = useState(0);

  const Page = pages[page];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <h2>Pipeline</h2>
          <p>Control Center</p>
        </div>

        <nav>
          {navItems.map(([id, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => setPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          API: 127.0.0.1:8000
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h2>Data Pipeline Control Center</h2>
        </header>

        <section className="content">
          {Page && (
            <Page
              version={version}
              onSuccess={() => setVersion((v) => v + 1)}
            />
          )}
        </section>
      </main>
    </div>
  );
}