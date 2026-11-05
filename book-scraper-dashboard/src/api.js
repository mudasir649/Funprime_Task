const DEFAULT_API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getApiBase() {
  return localStorage.getItem("apiBase") || DEFAULT_API;
}

export function saveApiBase(value) {
  const base = (value || "").trim() || DEFAULT_API;
  localStorage.setItem("apiBase", base);
  return base;
}

function buildUrl(base, path, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value != null) query.set(key, value);
  }
  const qs = query.toString();
  return base.replace(/\/+$/, "") + path + (qs ? `?${qs}` : "");
}

function getErrorMessage(body, status) {
  const detail = body?.detail;
  if (body?.error?.message) return body.error.message;
  if (typeof body?.message === "string") return body.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
  }
  return `Request failed (HTTP ${status})`;
}

async function request(base, method, path, params) {
  let res;
  try {
    res = await fetch(buildUrl(base, path, params), {
      method,
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error(`Cannot reach the API at ${base}. Is the backend running?`);
  }

  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // response wasn't JSON, ignore
  }

  if (!res.ok) throw new Error(getErrorMessage(body, res.status));
  return body;
}

export const startScrape = (base) => request(base, "POST", "/scrape");

export const getJob = (base, jobId) =>
  request(base, "GET", `/scrape/jobs/${encodeURIComponent(jobId)}`);

// The backend uses skip/limit, but the UI works with page/page_size.
export function getBooks(base, filters = {}) {
  const { category, min_price, max_price, page = 1, page_size = 20 } = filters;
  return request(base, "GET", "/books", {
    category,
    min_price,
    max_price,
    skip: (page - 1) * page_size,
    limit: page_size,
  });
}

export function extractBooks(body) {
  if (Array.isArray(body)) return { items: body, total: null };
  if (!body) return { items: [], total: null };

  return {
    items: body.items || body.results || body.data || body.books || [],
    total: body.total ?? body.total_count ?? body.count ?? null,
  };
}

const DONE_STATUSES = ["completed", "complete", "succeeded", "success", "done"];
const FAILED_STATUSES = ["failed", "error"];

const normalize = (s) => String(s).toLowerCase();

export const isFailedStatus = (s) => FAILED_STATUSES.includes(normalize(s));

export const isFinalStatus = (s) =>
  DONE_STATUSES.includes(normalize(s)) || isFailedStatus(s);