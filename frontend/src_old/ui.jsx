import { fmtNum } from "./utils";

const ICONS = {
  overview: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  runs: "M3 12a9 9 0 109-9M3 4v5h5M12 7v5l3 2",
  rejected: "M12 3l9 16H3zM12 10v4M12 17h.01",
  explorer: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  quality: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  play: "M7 4l13 8-13 8z",
  customers: "M16 8a4 4 0 11-8 0 4 4 0 018 0zM4 21c0-4 4-6 8-6s8 2 8 6",
  products: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  orders: "M6 3h12l2 4v14H4V7zM4 7h16M9 11h6",
  menu: "M4 6h16M4 12h16M4 18h16",
  refresh: "M20 12a8 8 0 10-2.3 5.7M20 5v5h-5",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
};

export const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
);

export const Spinner = ({ size = 18 }) => (
  <span className="spinner" style={{ width: size, height: size }} aria-label="Loading" />
);

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

export function MetricCard({ label, value, display, icon, tone = "accent", hint }) {
  return (
    <div className={`card metric tone-${tone}`}>
      <div className="metric-icon"><Icon name={icon} /></div>
      <div className="metric-body">
        <span className="metric-label">{label}</span>
        <strong className="metric-value">{display ?? fmtNum(value)}</strong>
        {hint && <span className="metric-hint">{hint}</span>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = String(status).toLowerCase();
  const tone = /succe|complet|ok|done/.test(s) ? "green"
    : /fail|error|reject/.test(s) ? "red"
    : /run|progress|pending|start/.test(s) ? "amber" : "gray";
  return <span className={`badge badge-${tone}`}><i />{status}</span>;
}

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={`card panel ${className}`}>
      {(title || action) && (
        <div className="panel-head"><h2>{title}</h2>{action}</div>
      )}
      {children}
    </section>
  );
}

export function LoadingState({ label = "Loading data…" }) {
  return <div className="state"><Spinner size={26} /><p>{label}</p></div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error">
      <div className="state-icon"><Icon name="rejected" size={22} /></div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && <button className="btn" onClick={onRetry}><Icon name="refresh" size={15} /> Try again</button>}
    </div>
  );
}

export function EmptyState({ title = "No data yet", message = "Run the pipeline to populate this view." }) {
  return (
    <div className="state">
      <div className="state-icon"><Icon name="explorer" size={22} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

/* Wraps a useApi result: loading / error / children */
export function Async({ loading, error, reload, children, label }) {
  if (loading) return <LoadingState label={label} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return children;
}

export function DataTable({ columns, rows, rowKey, onRowClick, empty }) {
  if (!rows.length) return empty || <EmptyState />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={rowKey ? rowKey(r, i) : i} onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={onRowClick ? "clickable" : ""}>
              {columns.map((c) => (
                <td key={c.key} className={c.className}>{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pages, onChange, total }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <span>{fmtNum(total)} rows · page {page} of {pages}</span>
      <div>
        <button className="btn btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <button className="btn btn-ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
