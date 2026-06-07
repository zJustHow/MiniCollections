import { translateError } from "./i18n";
import { appendIdListParams } from "./utils/filterParams";

const TOKEN_KEY = "auth_token";

/** Bust browser cache when seed media files are replaced at the same MinIO URL. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("minicollections-media/") && !/[?&]v=/.test(url)) {
    return `${url}${url.includes("?") ? "&" : "?"}v=2`;
  }
  return url;
}

export const COUNTRIES = [
  { code: "+86", zh: "中国大陆", en: "China" },
  { code: "+852", zh: "香港", en: "Hong Kong" },
  { code: "+853", zh: "澳门", en: "Macau" },
  { code: "+886", zh: "台湾", en: "Taiwan" },
  { code: "+1", zh: "美国/加拿大", en: "US/Canada" },
  { code: "+44", zh: "英国", en: "UK" },
  { code: "+81", zh: "日本", en: "Japan" },
  { code: "+82", zh: "韩国", en: "South Korea" },
  { code: "+65", zh: "新加坡", en: "Singapore" },
  { code: "+61", zh: "澳大利亚", en: "Australia" },
  { code: "+49", zh: "德国", en: "Germany" },
  { code: "+33", zh: "法国", en: "France" },
  { code: "+7", zh: "俄罗斯", en: "Russia" },
];

export function parsePhone(phone) {
  if (!phone) return { countryCode: "+86", phoneNumber: "" };
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const { code } of sorted) {
    if (phone.startsWith(code)) return { countryCode: code, phoneNumber: phone.slice(code.length) };
  }
  return { countryCode: "+86", phoneNumber: phone };
}

function parseApiError(errorText, fallbackCode = "error.request_failed") {
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
  const message = code
    ? translateError(code, args, _locale)
    : (errorText || translateError(fallbackCode, null, _locale));
  const err = new Error(message);
  err.code = code;
  err.args = args;
  return err;
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

let _locale = "en-US";
export function setCurrentLocale(locale) { _locale = locale; }

function authHeaders(extra = {}) {
  const token = getToken();
  const headers = { "Accept-Language": _locale, ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const login = async ({ identifier, password, loginType }) => {
  const body = { password };
  body[loginType === "phone" ? "phone" : "email"] = identifier;
  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await handleResponse(response);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getWechatAuthUrl = async (platform = "pc") => {
  const response = await fetch(`/auth/wechat/url?platform=${platform}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const exchangeWechatCode = async ({ code, state }) => {
  const response = await fetch("/auth/wechat/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
  });
  const data = await handleResponse(response);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const bindWechatAccount = async ({ code, state }) => {
  const response = await fetch("/auth/wechat/bind", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ code, state }),
  });
  return handleResponse(response);
};

export const sendCode = async (target, type) => {
  const response = await fetch("/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, type }),
  });
  return handleResponse(response);
};

export const sendForgotPasswordCode = async (target, type) => {
  const response = await fetch("/forgot-password/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, type }),
  });
  return handleResponse(response);
};

export const resetPassword = async (data) => {
  const response = await fetch("/forgot-password/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const signup = async (data) => {
  const response = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const PAGE_SIZE = 48;
export const FEEDBACK_PAGE_SIZE = 24;

async function fetchAllPages(fetchPage) {
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

function buildPageParams({
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

export const getBrandsPage = async ({ size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await fetch(`/brands?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getBrands = async () =>
  fetchAllPages(({ size, page }) => getBrandsPage({ size, page }));

export const searchBrandsPage = async (keyword, { size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page, keyword });
  const response = await fetch(`/brands/search?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchBrandsCombinedPage = async (
  keyword,
  { size = PAGE_SIZE, page = 0, categoryIds = null, brandIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = buildPageParams({ size, page, keyword, categoryIds, brandIds, scaleIds, seriesIds });
  const response = await fetch(`/brands/search/combined?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchBrands = async (keyword) =>
  fetchAllPages(({ size, page }) => searchBrandsPage(keyword, { size, page }));

export const getGroups = async () => {
  const response = await fetch("/groups", { headers: authHeaders() });
  return handleResponse(response);
};

export const searchGroups = async (
  keyword,
  { categoryIds = null, brandIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = buildPageParams({ keyword, categoryIds, brandIds, scaleIds, seriesIds });
  const response = await fetch(`/groups/search?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchGroupsFacets = async (keyword) => {
  const params = new URLSearchParams({ keyword });
  const response = await fetch(`/groups/search/facets?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const createGroup = async (payload) => {
  const response = await fetch("/groups", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateGroup = async (groupId, payload) => {
  const response = await fetch(`/groups/${groupId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteGroup = async (groupId) => {
  const response = await fetch(`/groups/${groupId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
};

export const getBrandByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getSeriesByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}/series`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getCategories = async () => {
  const response = await fetch("/categories", { headers: authHeaders() });
  return handleResponse(response);
};

export const getScales = async () => {
  const response = await fetch("/scales", { headers: authHeaders() });
  return handleResponse(response);
};

export const getBrandObjectsPage = async (brandId, { size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await fetch(`/brands/${brandId}/objects?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getBrandObjectsByBrandId = async (brandId) =>
  fetchAllPages(({ size, page }) => getBrandObjectsPage(brandId, { size, page }));

export const getGroupById = async (groupId) => {
  const response = await fetch(`/groups/${groupId}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getBrandObjectById = async (id) => {
  const response = await fetch(`/brands/objects/${id}`, { headers: authHeaders() });
  return handleResponse(response);
};

const ANON_SESSION_KEY = "mc_anon_session";

export function getOrCreateAnonSessionId() {
  try {
    let id = localStorage.getItem(ANON_SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

async function recordView(url) {
  try {
    const sessionId = getOrCreateAnonSessionId();
    const response = await fetch(url, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(sessionId ? { sessionId } : {}),
    });
    if (response.status === 204) return;
  } catch {
    // ignore view tracking failures
  }
}

export const recordBrandView = (brandId) =>
  recordView(`/brands/${brandId}/views`);

export const recordModelView = (objectId) =>
  recordView(`/brands/objects/${objectId}/views`);

export function formatViewCount(count, t) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1_000_000) {
    const value = (n / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return t("viewsCountMillion", { count: value });
  }
  if (n >= 1_000) {
    const value = (n / 1_000).toFixed(1).replace(/\.0$/, "");
    return t("viewsCountThousand", { count: value });
  }
  return t("viewsCount", { count: n });
}

export const searchBrandObjectsPage = async (
  keyword,
  { size = PAGE_SIZE, page = 0, categoryIds = null, brandIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = buildPageParams({ size, page, keyword, categoryIds, brandIds, scaleIds, seriesIds });
  const response = await fetch(`/brands/objects/search?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchBrandObjectsFacets = async (
  keyword,
  { categoryIds = null, brandIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = new URLSearchParams({ keyword });
  appendIdListParams(params, "categoryIds", categoryIds);
  appendIdListParams(params, "brandIds", brandIds);
  appendIdListParams(params, "scaleIds", scaleIds);
  appendIdListParams(params, "seriesIds", seriesIds);
  const response = await fetch(`/brands/objects/search/facets?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const searchBrandObjects = async (keyword) =>
  fetchAllPages(({ size, page }) => searchBrandObjectsPage(keyword, { size, page }));

export const searchBrandObjectsByBrandIdPage = async (
  brandId,
  keyword,
  { size = PAGE_SIZE, page = 0, categoryIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = buildPageParams({ size, page, keyword, categoryIds, scaleIds, seriesIds });
  const response = await fetch(`/brands/${brandId}/objects/search?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const searchBrandObjectsByBrandIdFacets = async (
  brandId,
  keyword,
  { categoryIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  appendIdListParams(params, "categoryIds", categoryIds);
  appendIdListParams(params, "scaleIds", scaleIds);
  appendIdListParams(params, "seriesIds", seriesIds);
  const response = await fetch(
    `/brands/${brandId}/objects/search/facets?${params}`,
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const searchBrandObjectsByBrandId = async (brandId, keyword) =>
  fetchAllPages(({ size, page }) =>
    searchBrandObjectsByBrandIdPage(brandId, keyword, { size, page }),
  );

export const searchBrandsCombined = async (keyword) => {
  const response = await searchBrandsCombinedPage(keyword);
  return {
    brands: response?.brands ?? [],
    objects: response?.objects ?? [],
  };
};

export const getUserObjects = async (groupId) => {
  const response = await fetch(`/groups/${groupId}/objects`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchGroupObjects = async (groupId, keyword) => {
  const response = await fetch(
    `/groups/${groupId}/objects/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
};

export const createUserObject = async (groupId, payload) => {
  const response = await fetch(`/groups/${groupId}/objects`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateUserObject = async (groupId, userObjectId, payload) => {
  const response = await fetch(`/groups/${groupId}/objects/${userObjectId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteUserObject = async (groupId, userObjectId) => {
  const response = await fetch(
    `/groups/${groupId}/objects/${userObjectId}`,
    { method: "DELETE", headers: authHeaders() }
  );
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/uploads/image", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText, "uploadFailed");
  }
  const data = await response.json();
  return data.url;
};

/** Remove a user upload from MinIO (cancel / remove before save). Safe to ignore failures. */
export const discardUploadedImage = async (url) => {
  if (!url) return;
  const response = await fetch(
    `/uploads/image?${new URLSearchParams({ url })}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
};

export const uploadBrandLogo = async (brandId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`/admin/brands/${brandId}/logo`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText, "uploadFailed");
  }
  return handleResponse(response);
};

export const getMe = async () => {
  const response = await fetch("/users/me", { headers: authHeaders() });
  return handleResponse(response);
};

export const updateProfile = async ({ displayName }) => {
  const response = await fetch("/users/me", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ display_name: displayName }),
  });
  return handleResponse(response);
};

export const updatePassword = async ({ currentPassword, newPassword }) => {
  const response = await fetch("/users/me/password", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  return handleResponse(response);
};

export const updateIdentifier = async (payload) => {
  const response = await fetch("/users/me/identifier", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateLocale = async (preferredLocale) => {
  const response = await fetch("/users/me/locale", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ preferred_locale: preferredLocale }),
  });
  return handleResponse(response);
};

export const getMySubmissionsPage = async ({ size = FEEDBACK_PAGE_SIZE, page = 0 } = {}) => {
  const params = new URLSearchParams({ size: String(size), page: String(page) });
  const response = await fetch(`/submissions/mine?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const submitFeedback = async (body) => {
  const response = await fetch("/submissions", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const deleteMySubmission = async (id) => {
  const response = await fetch(`/submissions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const getAdminSubmissions = async (status) => {
  const url = status ? `/admin/submissions?status=${status}` : "/admin/submissions";
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
};

export const approveSubmission = async (id, body) => {
  const response = await fetch(`/admin/submissions/${id}/approve`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const rejectSubmission = async (id, reason) => {
  const response = await fetch(`/admin/submissions/${id}/reject`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};

export const adminCreateBrand = async (payload) => {
  const response = await fetch("/admin/brands", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminUpdateBrand = async (id, payload) => {
  const response = await fetch(`/admin/brands/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminDeleteBrand = async (id) => {
  const response = await fetch(`/admin/brands/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
};

export const adminCreateBrandObject = async (brandId, payload) => {
  const response = await fetch(`/admin/brands/${brandId}/objects`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminUpdateBrandObject = async (id, payload) => {
  const response = await fetch(`/admin/brands/objects/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminDeleteBrandObject = async (id) => {
  const response = await fetch(`/admin/brands/objects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
};

export const adminCreateSeries = async (brandId, payload) => {
  const response = await fetch(`/admin/series/brands/${brandId}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminUpdateSeries = async (id, payload) => {
  const response = await fetch(`/admin/series/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminDeleteSeries = async (id) => {
  const response = await fetch(`/admin/series/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/uploads/users/me/avatar", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

export const purchasePriceFromFormValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return { purchase_price: null };
  }
  const n = typeof value === "string" ? parseFloat(value, 10) : value;
  if (Number.isNaN(n)) {
    return { purchase_price: null };
  }
  return { purchase_price: n };
};

export const displayPurchasePriceFromObject = (obj) => {
  if (!obj) return undefined;
  return obj.purchase_price ?? obj.purchasePrice;
};

export const formatReleasePrice = (obj) => {
  const cny = obj?.releasePriceCny ?? obj?.release_price_cny;
  const usd = obj?.releasePriceUsd ?? obj?.release_price_usd;
  const parts = [];
  if (cny != null) parts.push(`¥${cny}`);
  if (usd != null) parts.push(`$${usd}`);
  return parts.length > 0 ? parts.join(" / ") : null;
};
