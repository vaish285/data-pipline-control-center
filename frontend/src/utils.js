export const fmtNum = (n) => Number(n ?? 0).toLocaleString();

export function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d)
    ? String(v)
    : d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

export function fmtDuration(a, b) {
  const s = Date.parse(a);
  const e = Date.parse(b);

  if (isNaN(s) || isNaN(e) || e < s) return "—";

  const sec = (e - s) / 1000;

  return sec < 60
    ? `${sec.toFixed(1)}s`
    : `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
}

export const cellText = (v) =>
  v === null || v === undefined
    ? "—"
    : typeof v === "object"
      ? JSON.stringify(v)
      : String(v);

export function timeAgo(date) {
  if (!date) return "—";

  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );

  if (!Number.isFinite(seconds)) return "—";
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
}