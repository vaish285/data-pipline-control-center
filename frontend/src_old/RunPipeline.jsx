import { useState } from "react";
import { api } from "./api";
import { Card, Icon, PageHeader, Spinner } from "./ui";

export default function RunPipeline({ onSuccess }) {
  const [state, setState] = useState({ status: "idle", result: null, error: null });

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

  return (
    <>
      <PageHeader title="Run Pipeline" subtitle="Trigger the ETL process and refresh every dashboard." />
      <Card className="run-card">
        <div className={`run-hero ${status}`}>
          <div className="run-orb"><Icon name="play" size={28} /></div>
          <h2>
            {status === "idle" && "Ready to run"}
            {status === "loading" && "Pipeline running…"}
            {status === "success" && "Pipeline completed"}
            {status === "error" && "Pipeline failed"}
          </h2>
          <p className="muted">
            {status === "idle" && "Extract, validate, and load your latest data."}
            {status === "loading" && "This may take a few moments. Please keep this page open."}
            {status === "success" && "Dashboard data has been refreshed."}
            {status === "error" && error}
          </p>
          <button className="btn btn-primary btn-lg" onClick={run} disabled={loading}>
            {loading ? <><Spinner size={16} /> Running…</> : <><Icon name="play" size={16} /> {status === "idle" ? "Run pipeline" : "Run again"}</>}
          </button>
        </div>
        {status === "success" && result && typeof result === "object" && (
          <pre className="code">{JSON.stringify(result, null, 2)}</pre>
        )}
      </Card>
    </>
  );
}
