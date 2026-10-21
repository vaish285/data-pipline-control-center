import { api, normalizeRun, sortRuns, toList } from "../api";
import { useApi } from "../hooks/useApi";
import { Async, Card, DataTable, Icon, PageHeader, StatusBadge } from "../components/ui";
import { fmtDate, fmtDuration, fmtNum } from "../utils";

export default function PipelineRuns({ version }) {
  const { data, loading, error, reload } = useApi(() => api.runs(), [version]);
  const runs = sortRuns(toList(data).map(normalizeRun));

  return (
    <>
      <PageHeader title="Pipeline Runs" subtitle="History of every ETL execution.">
        <button className="btn btn-ghost" onClick={reload}><Icon name="refresh" size={15} /> Refresh</button>
      </PageHeader>
      <Card>
        <Async loading={loading} error={error} reload={reload} label="Loading runs…">
          <DataTable
            rows={runs}
            rowKey={(r) => r.id}
            columns={[
              { key: "id", label: "Run", render: (r) => <span className="mono">#{r.id}</span> },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
              { key: "started", label: "Started", render: (r) => fmtDate(r.started) },
              { key: "finished", label: "Finished", render: (r) => fmtDate(r.finished) },
              { key: "duration", label: "Duration", render: (r) => fmtDuration(r.started, r.finished) },
              { key: "processed", label: "Processed", className: "num", render: (r) => fmtNum(r.processed) },
              { key: "rejected", label: "Rejected", className: "num", render: (r) => (
                <span className={r.rejected ? "text-red" : ""}>{fmtNum(r.rejected)}</span>
              ) },
            ]}
          />
        </Async>
      </Card>
    </>
  );
}
