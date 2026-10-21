export const fmtNum = (n) => Number(n ?? 0).toLocaleString();

export function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function fmtDuration(a, b) {
  const s = Date.parse(a), e = Date.parse(b);
  if (isNaN(s) || isNaN(e) || e < s) return "—";
  const sec = (e - s) / 1000;
  return sec < 60 ? `${sec.toFixed(1)}s` : `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
}

export const cellText = (v) =>
  v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);
