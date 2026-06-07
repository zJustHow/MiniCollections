import {
  authHeaders,
  buildPageParams,
  fetchAllPages,
  handleResponse,
  PAGE_SIZE,
} from "./apiClient";
import { appendIdListParams } from "./filterParams";

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
