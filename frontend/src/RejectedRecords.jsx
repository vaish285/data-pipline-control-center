import { useState } from "react";
import { api, normalizeRejected, toList } from "./api";
import { useApi } from "./useApi";
import { Async, Card, DataTable, EmptyState, Icon, PageHeader } from "./ui";
import { cellText, fmtDate, fmtNum } from "./utils";

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
      <PageHeader
        title="Rejected Records"
        subtitle={data ? `${fmtNum(rows.length)} records failed validation, with their original payload.` : "Orders that failed validation, with the original payload."}
      >
        <button className="btn btn-ghost btn-sm" onClick={reload}><Icon name="refresh" size={14} /> Refresh</button>
      </PageHeader>
      <Card>
        <Async loading={loading} error={error} reload={reload} label="Loading rejected records…">
          <DataTable
            rows={rows}
            rowKey={(r) => r.key}
            empty={<EmptyState title="No rejected records" message="Every record passed validation." />}
            columns={[
              { key: "orderId", label: "Order ID", className: "mono", render: (r) => cellText(r.orderId) },
              { key: "reason", label: "Reason", className: "reason", render: (r) => <span className="badge badge-red"><i />{r.reason}</span> },
              { key: "original", label: "Original record", className: "wide", render: (r) => <Original value={r.original} /> },
              { key: "time", label: "Timestamp", className: "dim", render: (r) => fmtDate(r.time) },
            ]}
          />
        </Async>
      </Card>
    </>
  );
}
