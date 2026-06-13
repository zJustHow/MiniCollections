import {
  authHeaders,
  buildPageParams,
  handleResponse,
  PAGE_SIZE,
  apiFetch,
} from "./client.js";

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

export const searchBrandObjectsByBrandIdPage = async (
  brandId,
  keyword,
  { size = PAGE_SIZE, page = 0 } = {},
) => {
  const params = buildPageParams({ size, page, keyword });
  const response = await apiFetch(`/brands/${brandId}/objects/search?${params}`, {
    headers: authHeaders(),
  });
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
