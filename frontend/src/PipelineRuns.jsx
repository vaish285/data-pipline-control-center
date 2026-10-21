import { api, normalizeRun, sortRuns, toList } from "./api";
import { useApi } from "./useApi";
import { Async, Card, DataTable, Icon, PageHeader, StatusBadge } from "./ui";
import { fmtDate, fmtDuration, fmtNum } from "./utils";

export default function PipelineRuns({ version }) {
  const { data, loading, error, reload } = useApi(() => api.runs(), [version]);
  const runs = sortRuns(toList(data).map(normalizeRun));

  return (
    <>
      <PageHeader
        title="Pipeline Runs"
        subtitle={data ? `${fmtNum(runs.length)} executions recorded, newest first.` : "History of every ETL execution."}
      >
        <button className="btn btn-ghost btn-sm" onClick={reload}><Icon name="refresh" size={14} /> Refresh</button>
      </PageHeader>
      <Card>
        <Async loading={loading} error={error} reload={reload} label="Loading runs…">
          <DataTable
            rows={runs}
            rowKey={(r) => r.id}
            columns={[
              { key: "id", label: "Run", className: "mono", render: (r) => `#${r.id}` },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
              { key: "started", label: "Started", render: (r) => fmtDate(r.started) },
              { key: "finished", label: "Finished", className: "dim", render: (r) => fmtDate(r.finished) },
              { key: "duration", label: "Duration", className: "dim", render: (r) => fmtDuration(r.started, r.finished) },
              { key: "processed", label: "Processed", className: "num", render: (r) => fmtNum(r.processed) },
              { key: "rejected", label: "Rejected", className: "num", render: (r) => (
                <span className={r.rejected ? "text-red" : "dim"}>{fmtNum(r.rejected)}</span>
              ) },
            ]}
          />
        </Async>
      </Card>
    </>
  );
}
