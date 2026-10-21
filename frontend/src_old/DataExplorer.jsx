import { useMemo, useState } from "react";
import { api, toList } from "./api";
import { useApi } from "./useApi";
import { Async, Card, DataTable, EmptyState, Icon, PageHeader, Pagination } from "./ui";
import { cellText } from "./utils";

const TABS = [
  { id: "customers", label: "Customers", fetch: api.customers },
  { id: "products", label: "Products", fetch: api.products },
  { id: "orders", label: "Orders", fetch: api.orders },
];
const PAGE_SIZE = 15;
const label = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function Explorer({ tab, version }) {
  const { data, loading, error, reload } = useApi(() => tab.fetch(), [version]);
  const [query, setQuery] = useState("");
  const [fcol, setFcol] = useState("");
  const [fval, setFval] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => toList(data), [data]);
  const cols = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);
  const facets = useMemo(
    () => cols.filter((c) => {
      const vals = new Set(rows.map((r) => r[c]));
      return vals.size > 1 && vals.size <= 12 && rows.every((r) => typeof r[c] !== "object");
    }),
    [cols, rows]
  );
  const options = useMemo(
    () => (fcol ? [...new Set(rows.map((r) => cellText(r[fcol])))].sort() : []),
    [fcol, rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) =>
      (!fcol || !fval || cellText(r[fcol]) === fval) &&
      (!q || cols.some((c) => cellText(r[c]).toLowerCase().includes(q)))
    );
  }, [rows, cols, query, fcol, fval]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card>
      <Async loading={loading} error={error} reload={reload} label={`Loading ${tab.label.toLowerCase()}…`}>
        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={16} />
            <input placeholder={`Search ${tab.label.toLowerCase()}…`} value={query}
                   onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          </div>
          {facets.length > 0 && (
            <>
              <select value={fcol} onChange={(e) => { setFcol(e.target.value); setFval(""); setPage(1); }}>
                <option value="">Filter by…</option>
                {facets.map((c) => <option key={c} value={c}>{label(c)}</option>)}
              </select>
              {fcol && (
                <select value={fval} onChange={(e) => { setFval(e.target.value); setPage(1); }}>
                  <option value="">All values</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
            </>
          )}
        </div>
        <DataTable
          rows={view}
          rowKey={(_, i) => i}
          empty={<EmptyState title={rows.length ? "No matches" : `No ${tab.label.toLowerCase()} yet`}
                             message={rows.length ? "Try a different search or filter." : "Run the pipeline to load data."} />}
          columns={cols.map((c) => ({ key: c, label: label(c), render: (r) => cellText(r[c]) }))}
        />
        <Pagination page={page} pages={pages} total={filtered.length} onChange={setPage} />
      </Async>
    </Card>
  );
}

export default function DataExplorer({ version }) {
  const [active, setActive] = useState("customers");
  const tab = TABS.find((t) => t.id === active);
  return (
    <>
      <PageHeader title="Data Explorer" subtitle="Browse the clean tables loaded by the pipeline.">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={t.id === active ? "active" : ""} onClick={() => setActive(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </PageHeader>
      <Explorer key={tab.id} tab={tab} version={version} />
    </>
  );
}
