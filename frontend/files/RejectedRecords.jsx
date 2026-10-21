import { useState } from "react";
import { api, normalizeRejected, toList } from "../api";
import { useApi } from "../hooks/useApi";
import { Async, Card, DataTable, EmptyState, Icon, PageHeader } from "../components/ui";
import { cellText, fmtDate } from "../utils";

function Original({ value }) {
  const [open, setOpen] = useState(false);
  const full = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "—");
  return (
    <div>
      <button className="link" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        {open ? "Hide record" : "View record"}
      </button>
      {open ? <pre className="code">{full}</pre> : <code className="code-inline">{cellText(value)}</code>}
    </div>
  );
}

export default function RejectedRecords({ version }) {
  const { data, loading, error, reload } = useApi(() => api.rejected(), [version]);
  const rows = toList(data).map(normalizeRejected);

  return (
    <>
      <PageHeader title="Rejected Records" subtitle="Orders that failed validation, with the original payload.">
        <button className="btn btn-ghost" onClick={reload}><Icon name="refresh" size={15} /> Refresh</button>
      </PageHeader>
      <Card>
        <Async loading={loading} error={error} reload={reload} label="Loading rejected records…">
          <DataTable
            rows={rows}
            rowKey={(r) => r.key}
            empty={<EmptyState title="No rejected records" message="Every record passed validation." />}
            columns={[
              { key: "orderId", label: "Order ID", render: (r) => <span className="mono">{cellText(r.orderId)}</span> },
              { key: "reason", label: "Reason", render: (r) => <span className="badge badge-red"><i />{r.reason}</span> },
              { key: "original", label: "Original record", className: "wide", render: (r) => <Original value={r.original} /> },
              { key: "time", label: "Timestamp", render: (r) => fmtDate(r.time) },
            ]}
          />
        </Async>
      </Card>
    </>
  );
}
