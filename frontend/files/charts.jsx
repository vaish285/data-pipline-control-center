import { fmtNum } from "../utils";

export function Donut({ segments, center, sub }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" width="160" height="160">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--panel-2)" strokeWidth="14" />
        {total > 0 && segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="14"
                    strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
                    transform="rotate(-90 70 70)" className="donut-seg" />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="donut-center">{center}</text>
        <text x="70" y="86" textAnchor="middle" className="donut-sub">{sub}</text>
      </svg>
      <ul className="legend">
        {segments.map((s) => (
          <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{fmtNum(s.value)}</b></li>
        ))}
      </ul>
    </div>
  );
}

export function HBars({ items, color = "var(--accent)" }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="hbars">
      {items.map((i) => (
        <li key={i.label}>
          <div className="hbar-top"><span title={i.label}>{i.label}</span><b>{fmtNum(i.value)}</b></div>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(i.value / max) * 100}%`, background: color }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function RunColumns({ runs }) {
  const data = runs.slice(0, 12).reverse();
  const max = Math.max(1, ...data.map((r) => r.processed + r.rejected));
  return (
    <div>
      <div className="columns">
        {data.map((r) => (
          <div key={r.id} className="col" title={`Run ${r.id}: ${r.processed} processed, ${r.rejected} rejected`}>
            <div className="col-stack" style={{ height: `${((r.processed + r.rejected) / max) * 100}%` }}>
              <div style={{ flex: r.rejected, background: "var(--red)" }} />
              <div style={{ flex: r.processed, background: "var(--accent)" }} />
            </div>
            <span>#{r.id}</span>
          </div>
        ))}
      </div>
      <ul className="legend legend-inline">
        <li><i style={{ background: "var(--accent)" }} />Processed</li>
        <li><i style={{ background: "var(--red)" }} />Rejected</li>
      </ul>
    </div>
  );
}
