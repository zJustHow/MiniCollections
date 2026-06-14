import {
  authHeaders,
  buildPageParams,
  handleResponse,
  PAGE_SIZE,
  apiFetch,
} from "./client.js";
import { appendIdListParams } from "@minicollections/core";

export const getBrandsPage = async ({ size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await apiFetch(`/brands?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getBrandByBrandId = async (brandId) => {
  const response = await apiFetch(`/brands/${brandId}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchBrandsPage = async (keyword, { size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page, keyword });
  const response = await apiFetch(`/brands/search?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

/**
 * @param {string} keyword
 * @param {{ size?: number, page?: number, categoryIds?: number[] | null, brandIds?: number[] | null, scaleIds?: number[] | null, seriesIds?: number[] | null }} [options]
 */
export const searchBrandsCombinedPage = async (
  keyword,
  { size = PAGE_SIZE, page = 0, categoryIds = null, brandIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = buildPageParams({
    size,
    page,
    keyword,
    categoryIds,
    brandIds,
    scaleIds,
    seriesIds,
  });
  const response = await apiFetch(`/brands/search/combined?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * @param {string} keyword
 * @param {{ categoryIds?: number[] | null, brandIds?: number[] | null, scaleIds?: number[] | null, seriesIds?: number[] | null }} [options]
 */
export const searchBrandObjectsFacets = async (
  keyword,
  { categoryIds = null, brandIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  appendIdListParams(params, "categoryIds", categoryIds);
  appendIdListParams(params, "brandIds", brandIds);
  appendIdListParams(params, "scaleIds", scaleIds);
  appendIdListParams(params, "seriesIds", seriesIds);
  const response = await apiFetch(`/brands/objects/search/facets?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * @param {string} keyword
 * @param {{ size?: number, page?: number, categoryIds?: number[] | null, brandIds?: number[] | null, scaleIds?: number[] | null, seriesIds?: number[] | null }} [options]
 */
export const searchBrandObjectsPage = async (
  keyword,
  {
    size = PAGE_SIZE,
    page = 0,
    categoryIds = null,
    brandIds = null,
    scaleIds = null,
    seriesIds = null,
  } = {},
) => {
  const params = buildPageParams({
    size,
    page,
    keyword,
    categoryIds,
    brandIds,
    scaleIds,
    seriesIds,
  });
  const response = await apiFetch(`/brands/objects/search?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const SELECT_PAGE_SIZE = 20;

/**
 * @param {string} keyword
 * @param {{ size?: number, page?: number }} [options]
 * @returns {Promise<Array<{ id: number | string, name?: string, image_url?: string | null }>>}
 */
export async function searchBrandObjectsForSelect(
  keyword,
  { size = SELECT_PAGE_SIZE, page = 0 } = {},
) {
  const trimmed = (keyword ?? "").trim();
  if (!trimmed) return [];
  const response = await searchBrandObjectsPage(trimmed, { size, page });
  return response?.content ?? [];
}

export const getBrandObjectsPage = async (brandId, { size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await apiFetch(`/brands/${brandId}/objects?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const getBrandObjectById = async (id) => {
  const response = await apiFetch(`/brands/objects/${id}`, { headers: authHeaders() });
  return handleResponse(response);
};

/**
 * @param {string | number} brandId
 * @param {string} keyword
 * @param {{ size?: number, page?: number, categoryIds?: number[] | null, scaleIds?: number[] | null, seriesIds?: number[] | null }} [options]
 */
export const searchBrandObjectsByBrandIdPage = async (
  brandId,
  keyword,
  { size = PAGE_SIZE, page = 0, categoryIds = null, scaleIds = null, seriesIds = null } = {},
) => {
  const params = buildPageParams({
    size,
    page,
    keyword,
    categoryIds,
    scaleIds,
    seriesIds,
  });
  const response = await apiFetch(`/brands/${brandId}/objects/search?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/**
 * @param {string | number} brandId
 * @param {string} keyword
 * @param {{ categoryIds?: number[] | null, scaleIds?: number[] | null, seriesIds?: number[] | null }} [options]
 */
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
  const response = await apiFetch(
    `/brands/${brandId}/objects/search/facets?${params}`,
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const getSeriesByBrandId = async (brandId) => {
  const response = await apiFetch(`/brands/${brandId}/series`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const getCategories = async () => {
  const response = await apiFetch("/categories", { headers: authHeaders() });
  return handleResponse(response);
};

export const getScales = async () => {
  const response = await apiFetch("/scales", { headers: authHeaders() });
  return handleResponse(response);
};

/** Bust browser cache when seed media files are replaced at the same MinIO URL. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (url.includes("minicollections-media/") && !/[?&]v=/.test(url)) {
    return `${url}${url.includes("?") ? "&" : "?"}v=2`;
  }
  return url;
}

const ANON_SESSION_KEY = "mc_anon_session";
let memoryAnonSessionId = null;

export function getOrCreateAnonSessionId() {
  try {
    if (typeof localStorage !== "undefined" && localStorage != null) {
      let id = localStorage.getItem(ANON_SESSION_KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(ANON_SESSION_KEY, id);
      }
      return id;
    }
  } catch {
    // ignore storage errors
  }
  if (!memoryAnonSessionId) {
    memoryAnonSessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return memoryAnonSessionId;
}

async function recordView(path) {
  try {
    const sessionId = getOrCreateAnonSessionId();
    const response = await apiFetch(path, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(sessionId ? { sessionId } : {}),
    });
    if (response.status === 204) return;
  } catch {
    // ignore view tracking failures
  }
}

export const recordBrandView = (brandId) => recordView(`/brands/${brandId}/views`);

export const recordModelView = (objectId) =>
  recordView(`/brands/objects/${objectId}/views`);
