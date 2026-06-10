import { translateError } from "../i18n";
import { appendIdListParams } from "./filterParams";

const TOKEN_KEY = "auth_token";

let _locale = "en-US";
export function setCurrentLocale(locale) {
  _locale = locale;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function authHeaders(extra = {}) {
  const token = getToken();
  const headers = { "Accept-Language": _locale, ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function parseApiError(
  errorText,
  fallbackCode = "error.request_failed",
  status,
) {
  let code;
  let args;
  try {
    const parsed = JSON.parse(errorText);
    if (parsed && typeof parsed.code === "string") {
      code = parsed.code;
      args = parsed.args ?? null;
    }
  } catch {
    // plain-text or non-JSON error body
  }

  let message;
  if (code) {
    message = translateError(code, args, _locale);
  } else if (errorText?.trim()) {
    message = errorText.trim();
  } else if (status === 401 || status === 403) {
    message = translateError("error.no_permission", null, _locale);
  } else if (status != null && status >= 500) {
    message = translateError("error.internal_server_error", null, _locale);
  } else {
    message = translateError(fallbackCode, null, _locale);
  }

  const err = new Error(message);
  err.code = code;
  err.args = args;
  return err;
}

export async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText, "error.request_failed", response.status);
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function handleDeleteResponse(response) {
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText, "error.request_failed", response.status);
  }
}

export const PAGE_SIZE = 48;
export const SKELETON_CARD_COUNT = 16;
export const FEEDBACK_PAGE_SIZE = 24;

export async function fetchAllPages(fetchPage) {
  const all = [];
  let page = 0;
  let totalPages = 1;
  while (page < totalPages) {
    const response = await fetchPage({ size: 48, page });
    all.push(...(response?.content ?? []));
    totalPages = response?.total_pages ?? 0;
    page += 1;
  }
  return all;
}

export function buildPageParams({
  size = PAGE_SIZE,
  page = 0,
  keyword = null,
  categoryIds = null,
  brandIds = null,
  scaleIds = null,
  seriesIds = null,
} = {}) {
  const params = new URLSearchParams({ size: String(size), page: String(page) });
  if (keyword) params.set("keyword", keyword);
  appendIdListParams(params, "categoryIds", categoryIds);
  appendIdListParams(params, "brandIds", brandIds);
  appendIdListParams(params, "scaleIds", scaleIds);
  appendIdListParams(params, "seriesIds", seriesIds);
  return params;
}

export { TOKEN_KEY, parseApiError };
