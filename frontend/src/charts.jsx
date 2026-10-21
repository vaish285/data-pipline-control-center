import { fmtNum } from "./utils";

export function Donut({ segments, center, sub }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 54, c = 2 * Math.PI * r;
  const visible = segments.filter((s) => s.value > 0).length;
  const gap = visible > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" width="164" height="164" role="img" aria-label={`${center} ${sub}`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--panel-3)" strokeWidth="11" />
        {total > 0 && segments.map((s) => {
          const len = (s.value / total) * c;
          const el = s.value > 0 && (
            <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="11"
                    strokeDasharray={`${Math.max(0, len - gap)} ${c - Math.max(0, len - gap)}`}
                    strokeDashoffset={-offset} transform="rotate(-90 70 70)" className="donut-seg" />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="69" textAnchor="middle" className="donut-center">{center}</text>
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
      <div className="chart">
        <div className="yaxis">
          <span>{fmtNum(max)}</span><span>{fmtNum(Math.round(max / 2))}</span><span>0</span>
        </div>
        <div className="chart-body">
          <div className="plot">
            {data.map((r) => (
              <div key={r.id} className="bar" data-tip={`Run #${r.id} · ${fmtNum(r.processed)} processed · ${fmtNum(r.rejected)} rejected`}>
                <div className="bar-stack" style={{ height: `${((r.processed + r.rejected) / max) * 100}%` }}>
                  <div style={{ flex: r.rejected, background: "var(--red)" }} />
                  <div style={{ flex: r.processed, background: "var(--accent)" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="xaxis">{data.map((r) => <span key={r.id}>#{r.id}</span>)}</div>
        </div>
      </div>
      <ul className="legend legend-inline">
        <li><i style={{ background: "var(--accent)" }} />Processed</li>
        <li><i style={{ background: "var(--red)" }} />Rejected</li>
      </ul>
    </div>
  );
}
