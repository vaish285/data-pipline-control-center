export const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(
      `Cannot reach the API at ${API_BASE}. Is the FastAPI server running with CORS enabled?`
    );
  }

  if (!res.ok) {
    let detail = "";

    try {
      const body = await res.json();
      detail =
        typeof body.detail === "string"
          ? body.detail
          : JSON.stringify(body.detail ?? body);
    } catch {
      // Ignore response parsing errors.
    }

    throw new Error(
      detail || `Request failed (${res.status} ${res.statusText})`
    );
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* API endpoints */
export const api = {
  summary: () => request("/summary"),
  runs: () => request("/pipeline-runs"),
  rejected: () => request("/rejected-orders"),
  customers: () => request("/customers"),
  products: () => request("/products"),
  orders: () => request("/orders"),
  runPipeline: () =>
    request("/run-pipeline", { method: "POST" }),
};

/* Convert API responses into lists */
export const toList = (data) =>
  Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? Object.values(data).find(Array.isArray) ?? []
      : [];

const pick = (obj, keys, fallback = null) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return fallback;
};

const num = (value) =>
  typeof value === "number" ? value : Number(value) || 0;

/* Dashboard summary */
export function normalizeSummary(data) {
  const s = data || {};

  return {
    customers: num(
      pick(s, [
        "customers_count",
        "total_customers",
        "customers",
        "customer_count",
      ], 0)
    ),
    products: num(
      pick(s, [
        "products_count",
        "total_products",
        "products",
        "product_count",
      ], 0)
    ),
    orders: num(
      pick(s, [
        "orders_count",
        "total_orders",
        "orders",
        "order_count",
      ], 0)
    ),
    rejected: num(
      pick(s, [
        "rejected_orders_count",
        "rejected_records",
        "rejected_orders",
        "total_rejected",
        "rejected_count",
        "rejected",
      ], 0)
    ),
    runs: num(
      pick(s, [
        "pipeline_runs_count",
        "pipeline_runs",
        "total_runs",
        "runs",
        "run_count",
      ], 0)
    ),
  };
}

/* Normalize pipeline run records */
export function normalizeRun(run, index = 0) {
  const r = run || {};

  return {
    id: pick(r, ["id", "run_id"], index + 1),
    status: String(pick(r, ["status", "state"], "unknown")),
    started: pick(r, [
      "started_at",
      "start_time",
      "run_time",
      "created_at",
      "timestamp",
    ]),
    finished: pick(r, [
      "finished_at",
      "end_time",
      "completed_at",
    ]),
    processed: num(
      pick(r, [
        "records_processed",
        "processed_records",
        "processed_count",
        "total_processed",
        "processed",
        "valid_records",
      ], 0)
    ),
    rejected: num(
      pick(r, [
        "records_rejected",
        "rejected_records",
        "rejected_count",
        "total_rejected",
        "rejected",
      ], 0)
    ),
  };
}

/* Normalize rejected records */
export function normalizeRejected(record, index = 0) {
  const r = record || {};

  return {
    key: index,
    orderId: pick(r, ["order_id", "orderId", "id"], "—"),
    reason: String(
      pick(r, [
        "rejection_reason",
        "reason",
        "error",
        "error_message",
      ], "Unknown")
    ),
    original: pick(r, [
      "original_record",
      "raw_data",
      "raw_record",
      "record",
      "data",
      "payload",
    ], r),
    time: pick(r, [
      "created_at",
      "rejected_at",
      "timestamp",
      "run_time",
    ]),
  };
}

/* Sort newest pipeline runs first */
export const sortRuns = (runs) =>
  [...runs].sort((a, b) => {
    const timeA = Date.parse(a.started);
    const timeB = Date.parse(b.started);

    if (
      !Number.isNaN(timeA) &&
      !Number.isNaN(timeB) &&
      timeA !== timeB
    ) {
      return timeB - timeA;
    }

    return Number(b.id) - Number(a.id) || 0;
  });