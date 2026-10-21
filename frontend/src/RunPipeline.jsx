import { useEffect, useState } from "react";
import { api, normalizeRun, sortRuns, toList } from "./api";
import { useApi } from "./useApi";
import { Card, Icon, PageHeader, Spinner, StatusBadge } from "./ui";
import { fmtDate, fmtDuration, fmtNum } from "./utils";

const label = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const isScalar = (v) => ["string", "number", "boolean"].includes(typeof v);

export default function RunPipeline({ version, onSuccess }) {
  const [state, setState] = useState({ status: "idle", result: null, error: null });
  const [elapsed, setElapsed] = useState(0);
  const last = useApi(() => api.runs(), [version]);

  useEffect(() => {
    if (state.status !== "loading") return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  async function run() {
    setState({ status: "loading", result: null, error: null });
    try {
      const result = await api.runPipeline();
      setState({ status: "success", result, error: null });
      onSuccess();
    } catch (e) {
      setState({ status: "error", result: null, error: e.message });
    }
  }

  const { status, result, error } = state;
  const loading = status === "loading";
  const latest = sortRuns(toList(last.data).map(normalizeRun))[0];
  const details = result && typeof result === "object"
    ? Object.entries(result).filter(([, v]) => isScalar(v)).slice(0, 8) : [];

  return (
    <>
      <PageHeader title="Run Pipeline" subtitle="Trigger the ETL process and refresh every dashboard." />
      <div className="grid run-grid">
        <Card className="run-card">
          <div className={`run-hero ${status}`}>
            <div className="run-orb">
              <Icon name={status === "success" ? "check" : status === "error" ? "x" : "play"} size={26} />
            </div>
            <h2>
              {status === "idle" && "Ready to run"}
              {status === "loading" && "Pipeline running"}
              {status === "success" && "Pipeline completed"}
              {status === "error" && "Pipeline failed"}
            </h2>
            <p className="muted">
              {status === "idle" && "Extract, validate, and load your latest data."}
              {status === "loading" && `Elapsed ${elapsed}s · please keep this page open.`}
              {status === "success" && "Dashboard data has been refreshed."}
              {status === "error" && error}
            </p>
            {loading && <div className="progress" role="progressbar" aria-label="Pipeline running" />}
            <button className="btn btn-primary btn-lg" onClick={run} disabled={loading}>
              {loading
                ? <><Spinner size={15} /> Running…</>
                : <><Icon name="play" size={15} /> {status === "idle" ? "Run pipeline" : "Run again"}</>}
            </button>
          </div>

          {status === "success" && result && typeof result === "object" && (
            <div className="run-result">
              {details.length > 0 && (
                <dl className="kv">
                  {details.map(([k, v]) => (
                    <div key={k}><dt>{label(k)}</dt><dd>{typeof v === "number" ? fmtNum(v) : String(v)}</dd></div>
                  ))}
                </dl>
              )}
              <details>
                <summary>Raw response</summary>
                <pre className="code">{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          )}
        </Card>

        <Card title="Latest run">
          {latest ? (
            <dl className="kv kv-stack">
              <div><dt>Run</dt><dd className="mono">#{latest.id}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge status={latest.status} /></dd></div>
              <div><dt>Started</dt><dd>{fmtDate(latest.started)}</dd></div>
              <div><dt>Duration</dt><dd>{fmtDuration(latest.started, latest.finished)}</dd></div>
              <div><dt>Processed</dt><dd>{fmtNum(latest.processed)}</dd></div>
              <div><dt>Rejected</dt><dd className={latest.rejected ? "text-red" : ""}>{fmtNum(latest.rejected)}</dd></div>
            </dl>
          ) : (
            <p className="muted pad">{last.loading ? "Loading…" : "No runs recorded yet."}</p>
          )}
        </Card>
      </div>
    </>
  );
}
