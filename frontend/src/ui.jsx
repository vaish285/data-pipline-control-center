import { useEffect, useState } from "react";
import { fmtNum } from "./utils";

const ICONS = {
  overview: "M4 5.5A1.5 1.5 0 015.5 4h4A1.5 1.5 0 0111 5.5v4A1.5 1.5 0 019.5 11h-4A1.5 1.5 0 014 9.5zM13 5.5A1.5 1.5 0 0114.5 4h4A1.5 1.5 0 0120 5.5v2a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 0113 7.5zM13 13.5a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5zM4 15.5A1.5 1.5 0 015.5 14h4a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 019.5 20h-4A1.5 1.5 0 014 18.5z",
  runs: "M3.5 12a8.5 8.5 0 108.5-8.5M3.5 4v4.5H8M12 7.5V12l3 1.8",
  rejected: "M12 3.8l8.6 15.2H3.4zM12 10v4M12 16.8h.01",
  explorer: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  quality: "M12 3l7.5 2.8v5.7c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V5.8zM8.8 12l2.2 2.2 4.2-4.4",
  play: "M8 5.5v13l10.5-6.5z",
  customers: "M15.5 8a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM4.5 20c0-3.6 3.4-5.5 7.5-5.5s7.5 1.9 7.5 5.5",
  products: "M20.5 7.8L12 3.2 3.5 7.8v8.4l8.5 4.6 8.5-4.6zM3.8 8l8.2 4.4L20.2 8M12 12.4v8.2",
  orders: "M6.5 3.5h11l2 3.5v13.5h-15V7zM4.5 7h15M9 11h6",
  menu: "M4 7h16M4 12h16M4 17h16",
  refresh: "M19.5 12a7.5 7.5 0 10-2.2 5.3M19.5 4.8v4.7H15",
  search: "M10.8 18a7.2 7.2 0 100-14.4 7.2 7.2 0 000 14.4zM20.5 20.5l-4.6-4.6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6L6 18",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7.5V12l3 1.8",
  arrow: "M5 12h14M13.5 6.5L19 12l-5.5 5.5",
};

export const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
);

export const Spinner = ({ size = 18 }) => (
  <span className="spinner" style={{ width: size, height: size }} role="status" aria-label="Loading" />
);

export function statusTone(status) {
  const s = String(status).toLowerCase();
  if (/succe|complet|ok|done/.test(s)) return "green";
  if (/fail|error|reject/.test(s)) return "red";
  if (/run|progress|pending|start/.test(s)) return "amber";
  return "gray";
}

export function StatusBadge({ status }) {
  const tone = statusTone(status);
  return (
    <span className={`badge badge-${tone}${tone === "amber" ? " pulse" : ""}`}>
      <i />{status}
    </span>
  );
}

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

function useCountUp(target, ms = 700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !Number.isFinite(target)) { setV(target); return; }
    let raf, start;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function MetricCard({ label, value, display, icon, tone = "accent", hint }) {
  const animated = useCountUp(Number(value) || 0);
  return (
    <div className={`card metric tone-${tone}`}>
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon"><Icon name={icon} size={16} /></span>
      </div>
      <strong className="metric-value">{display ?? fmtNum(animated)}</strong>
      {hint && <span className="metric-hint">{hint}</span>}
    </div>
  );
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

export function LoadingState({ label = "Loading data…", variant = "table" }) {
  return (
    <div className="skeleton-wrap" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {variant === "dashboard" ? (
        <>
          <div className="card skel-block" style={{ height: 76, marginBottom: 16 }} />
          <div className="grid metrics">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="card skel-block" style={{ height: 112 }} />)}
          </div>
          <div className="grid split">
            <div className="card skel-block" style={{ height: 300 }} />
            <div className="card skel-block" style={{ height: 300 }} />
          </div>
        </>
      ) : (
        <div className="skel-rows">
          {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className="skel" style={{ width: `${96 - i * 6}%` }} />)}
        </div>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error">
      <div className="state-icon"><Icon name="rejected" size={20} /></div>
      <h3>Couldn’t load this data</h3>
      <p>{message}</p>
      {onRetry && <button className="btn" onClick={onRetry}><Icon name="refresh" size={15} /> Try again</button>}
    </div>
  );
}

export function EmptyState({ title = "No data yet", message = "Run the pipeline to populate this view." }) {
  return (
    <div className="state">
      <div className="state-icon"><Icon name="explorer" size={20} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

/* Wraps a useApi result: loading / error / children */
export function Async({ loading, error, reload, children, label, variant }) {
  if (loading) return <LoadingState label={label} variant={variant} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return children;
}

export function DataTable({ columns, rows, rowKey, onRowClick, empty }) {
  if (!rows.length) return empty || <EmptyState />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.className === "num" ? "num" : ""}>{c.label}</th>
            ))}
          </tr>
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
        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}
