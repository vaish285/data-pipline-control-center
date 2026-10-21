import { api, normalizeRejected, normalizeRun, normalizeSummary, sortRuns, toList } from "./api";
import { useApi } from "./useApi";
import { Async, Card, EmptyState, Icon, MetricCard, PageHeader } from "./ui";
import { Donut, HBars, RunColumns } from "./charts";

const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");

export default function DataQuality({ version }) {
  const { data, loading, error, reload } = useApi(
    () => Promise.all([api.summary(), api.runs(), api.rejected()]),
    [version]
  );

  return (
    <>
      <PageHeader title="Data Quality" subtitle="How clean is the data flowing through the pipeline?">
        <button className="btn btn-ghost btn-sm" onClick={reload}><Icon name="refresh" size={14} /> Refresh</button>
      </PageHeader>
      <Async loading={loading} error={error} reload={reload} label="Analysing data quality…" variant="dashboard">
        {data && (() => {
          const s = normalizeSummary(data[0]);
          const runs = sortRuns(toList(data[1]).map(normalizeRun));
          const rejected = toList(data[2]).map(normalizeRejected);
          const rejectedTotal = Math.max(s.rejected, rejected.length);
          const total = s.orders + rejectedTotal;
          const okRuns = runs.filter((r) => /succe|complet|ok|done/i.test(r.status)).length;
          const failRuns = runs.length - okRuns;

          const byReason = Object.entries(
            rejected.reduce((m, r) => ((m[r.reason] = (m[r.reason] || 0) + 1), m), {})
          ).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);

          if (!total && !runs.length) return <Card><EmptyState /></Card>;

          return (
            <>
              <div className="grid metrics metrics-3">
                <MetricCard label="Acceptance rate" display={pct(s.orders, total)} icon="quality" tone="green"
                            hint={`${s.orders.toLocaleString()} valid orders`} />
                <MetricCard label="Rejection rate" display={pct(rejectedTotal, total)} icon="rejected" tone="red"
                            hint={`${rejectedTotal.toLocaleString()} rejected records`} />
                <MetricCard label="Run success rate" display={pct(okRuns, runs.length)} icon="runs" tone="accent"
                            hint={`${okRuns} of ${runs.length} runs succeeded`} />
              </div>
              <div className="grid two">
                <Card title="Record validity">
                  <Donut center={pct(s.orders, total)} sub="valid"
                         segments={[
                           { label: "Valid orders", value: s.orders, color: "var(--green)" },
                           { label: "Rejected", value: rejectedTotal, color: "var(--red)" },
                         ]} />
                </Card>
                <Card title="Run outcomes">
                  <Donut center={String(runs.length)} sub="runs"
                         segments={[
                           { label: "Successful", value: okRuns, color: "var(--accent)" },
                           { label: "Failed / other", value: failRuns, color: "var(--amber)" },
                         ]} />
                </Card>
              </div>
              <div className="grid two">
                <Card title="Top rejection reasons">
                  {byReason.length ? <HBars items={byReason} color="var(--red)" /> : <p className="muted pad">No rejections recorded.</p>}
                </Card>
                <Card title="Volume per run">
                  {runs.length ? <RunColumns runs={runs} /> : <p className="muted pad">No runs yet.</p>}
                </Card>
              </div>
            </>
          );
        })()}
      </Async>
    </>
  );
}
