import { api, normalizeRun, normalizeSummary, sortRuns, toList } from "./api";
import { useApi } from "./useApi";
import { Async, Card, DataTable, MetricCard, PageHeader, StatusBadge, Icon, statusTone } from "./ui";
import { RunColumns } from "./charts";
import { fmtDate, fmtDuration, fmtNum, timeAgo } from "./utils";

function StatusBanner({ run }) {
  if (!run) {
    return (
      <div className="card banner banner-gray">
        <div className="banner-main">
          <span className="banner-dot" />
          <div><strong>No pipeline runs yet</strong><span>Trigger the first run to populate the dashboard.</span></div>
        </div>
      </div>
    );
  }
  const tone = statusTone(run.status);
  const title = tone === "green" ? "Last run completed successfully"
    : tone === "red" ? "Last run failed"
    : tone === "amber" ? "Pipeline is running" : `Last run: ${run.status}`;
  const ago = timeAgo(run.started);
  return (
    <div className={`card banner banner-${tone}`}>
      <div className="banner-main">
        <span className="banner-dot" />
        <div>
          <strong>{title}</strong>
          <span>Run #{run.id} · {fmtDate(run.started)}{ago && ` · ${ago}`}</span>
        </div>
      </div>
      <dl className="banner-stats">
        <div><dt>Processed</dt><dd>{fmtNum(run.processed)}</dd></div>
        <div><dt>Rejected</dt><dd>{fmtNum(run.rejected)}</dd></div>
        <div><dt>Duration</dt><dd>{fmtDuration(run.started, run.finished)}</dd></div>
      </dl>
    </div>
  );
}

export default function Overview({ version, navigate }) {
  const { data, loading, error, reload } = useApi(
    () => Promise.all([api.summary(), api.runs()]),
    [version]
  );

  return (
    <>
      <PageHeader title="Overview" subtitle="A live snapshot of your data pipeline.">
        <button className="btn btn-ghost btn-sm" onClick={reload}><Icon name="refresh" size={14} /> Refresh</button>
      </PageHeader>
      <Async loading={loading} error={error} reload={reload} label="Loading overview…" variant="dashboard">
        {data && (() => {
          const s = normalizeSummary(data[0]);
          const runs = sortRuns(toList(data[1]).map(normalizeRun));
          const totalRecords = s.orders + s.rejected;
          const rejectRate = totalRecords ? `${((s.rejected / totalRecords) * 100).toFixed(1)}% of all records` : "No records yet";
          return (
            <>
              <StatusBanner run={runs[0]} />
              <div className="grid metrics">
                <MetricCard label="Customers" value={s.customers} icon="customers" />
                <MetricCard label="Products" value={s.products} icon="products" tone="violet" />
                <MetricCard label="Orders" value={s.orders} icon="orders" tone="green" />
                <MetricCard label="Rejected records" value={s.rejected} icon="rejected" tone="red" hint={rejectRate} />
                <MetricCard label="Pipeline runs" value={s.runs} icon="runs" tone="amber" />
              </div>
              <div className="grid split">
                <Card
                  title="Recent runs"
                  action={navigate && (
                    <button className="link" onClick={() => navigate("runs")}>View all <Icon name="arrow" size={13} /></button>
                  )}
                >
                  <DataTable
                    rows={runs.slice(0, 5)}
                    rowKey={(r) => r.id}
                    columns={[
                      { key: "id", label: "Run", className: "mono", render: (r) => `#${r.id}` },
                      { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                      { key: "started", label: "Started", className: "dim", render: (r) => fmtDate(r.started) },
                      { key: "processed", label: "Processed", className: "num", render: (r) => fmtNum(r.processed) },
                      { key: "rejected", label: "Rejected", className: "num", render: (r) => (
                        <span className={r.rejected ? "text-red" : "dim"}>{fmtNum(r.rejected)}</span>
                      ) },
                    ]}
                  />
                </Card>
                <Card title="Processed vs rejected">
                  {runs.length ? <RunColumns runs={runs} /> : <p className="muted pad">No runs recorded yet.</p>}
                </Card>
              </div>
            </>
          );
        })()}
      </Async>
    </>
  );
}
