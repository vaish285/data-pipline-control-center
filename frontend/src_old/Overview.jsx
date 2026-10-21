import { api, normalizeRun, normalizeSummary, sortRuns, toList } from "./api";
import { useApi } from "./useApi";
import { Async, Card, DataTable, MetricCard, PageHeader, StatusBadge, Icon } from "./ui";
import { RunColumns } from "./charts";
import { fmtDate, fmtNum } from "./utils";

export default function Overview({ version }) {
  const { data, loading, error, reload } = useApi(
    () => Promise.all([api.summary(), api.runs()]),
    [version]
  );

  return (
    <>
      <PageHeader title="Overview" subtitle="Live snapshot of your data pipeline.">
        <button className="btn btn-ghost" onClick={reload}><Icon name="refresh" size={15} /> Refresh</button>
      </PageHeader>
      <Async loading={loading} error={error} reload={reload} label="Loading overview…">
        {data && (() => {
          const s = normalizeSummary(data[0]);
          const runs = sortRuns(toList(data[1]).map(normalizeRun));
          return (
            <>
              <div className="grid metrics">
                <MetricCard label="Customers" value={s.customers} icon="customers" />
                <MetricCard label="Products" value={s.products} icon="products" tone="violet" />
                <MetricCard label="Orders" value={s.orders} icon="orders" tone="green" />
                <MetricCard label="Rejected records" value={s.rejected} icon="rejected" tone="red" />
                <MetricCard label="Pipeline runs" value={s.runs} icon="runs" tone="amber" />
              </div>
              <div className="grid two">
                <Card title="Recent runs">
                  <DataTable
                    rows={runs.slice(0, 5)}
                    rowKey={(r) => r.id}
                    columns={[
                      { key: "id", label: "Run", render: (r) => `#${r.id}` },
                      { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                      { key: "started", label: "Started", render: (r) => fmtDate(r.started) },
                      { key: "processed", label: "Processed", className: "num", render: (r) => fmtNum(r.processed) },
                      { key: "rejected", label: "Rejected", className: "num", render: (r) => fmtNum(r.rejected) },
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
