export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(`Cannot reach the API at ${API_BASE}. Is the FastAPI server running with CORS enabled?`);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail ?? body);
    } catch { /* ignore */ }
    throw new Error(detail || `Request failed (${res.status} ${res.statusText})`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  summary: () => request("/summary"),
  runs: () => request("/pipeline-runs"),
  rejected: () => request("/rejected-orders"),
  customers: () => request("/customers"),
  products: () => request("/products"),
  orders: () => request("/orders"),
  runPipeline: () => request("/run-pipeline", { method: "POST" }),
};

/* ---------- tolerant response helpers (adjust key lists here if your fields differ) ---------- */
export const toList = (d) =>
  Array.isArray(d) ? d : d && typeof d === "object" ? Object.values(d).find(Array.isArray) ?? [] : [];

const pick = (obj, keys, fallback = null) => {
  for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  return fallback;
};
const num = (v) => (typeof v === "number" ? v : Number(v) || 0);

export function normalizeSummary(d) {
  const s = d || {};
  return {
    customers: num(pick(s, ["total_customers", "customers", "customer_count"], 0)),
    products: num(pick(s, ["total_products", "products", "product_count"], 0)),
    orders: num(pick(s, ["total_orders", "orders", "order_count"], 0)),
    rejected: num(pick(s, ["rejected_records", "rejected_orders", "total_rejected", "rejected_count", "rejected"], 0)),
    runs: num(pick(s, ["pipeline_runs", "total_runs", "runs", "run_count"], 0)),
  };
}

export function normalizeRun(r, i = 0) {
  return {
    id: pick(r, ["id", "run_id"], i + 1),
    status: String(pick(r, ["status", "state"], "unknown")),
    started: pick(r, ["started_at", "start_time", "run_time", "created_at", "timestamp"]),
    finished: pick(r, ["finished_at", "end_time", "completed_at"]),
    processed: num(pick(r, ["records_processed", "processed_records", "processed_count", "total_processed", "processed", "valid_records"], 0)),
    rejected: num(pick(r, ["records_rejected", "rejected_records", "rejected_count", "total_rejected", "rejected"], 0)),
  };
}

export function normalizeRejected(r, i = 0) {
  return {
    key: i,
    orderId: pick(r, ["order_id", "orderId", "id"], "—"),
    reason: String(pick(r, ["rejection_reason", "reason", "error", "error_message"], "Unknown")),
    original: pick(r, ["original_record", "raw_data", "raw_record", "record", "data", "payload"], r),
    time: pick(r, ["created_at", "rejected_at", "timestamp", "run_time"]),
  };
}

export const sortRuns = (runs) =>
  [...runs].sort((a, b) => {
    const ta = Date.parse(a.started), tb = Date.parse(b.started);
    if (!isNaN(ta) && !isNaN(tb) && ta !== tb) return tb - ta;
    return Number(b.id) - Number(a.id) || 0;
  });
