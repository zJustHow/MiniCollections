import {
  authHeaders,
  buildPageParams,
  handleDeleteResponse,
  handleResponse,
  PAGE_SIZE,
  apiFetch,
} from "./client.js";

export const getGroupsPage = async ({ size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await apiFetch(`/groups?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getGroupById = async (groupId) => {
  const response = await apiFetch(`/groups/${groupId}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getUserObjectsPage = async (groupId, { size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await apiFetch(`/groups/${groupId}/objects?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const createUserObject = async (groupId, payload) => {
  const response = await apiFetch(`/groups/${groupId}/objects`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const createGroup = async (payload) => {
  const response = await apiFetch("/groups", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateGroup = async (groupId, payload) => {
  const response = await apiFetch(`/groups/${groupId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteGroup = async (groupId) => {
  const response = await apiFetch(`/groups/${groupId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleDeleteResponse(response);
};

export const getUserObjectById = async (groupId, userObjectId) => {
  const response = await apiFetch(`/groups/${groupId}/objects/${userObjectId}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const updateUserObject = async (groupId, userObjectId, payload) => {
  const response = await apiFetch(`/groups/${groupId}/objects/${userObjectId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteUserObject = async (groupId, userObjectId) => {
  const response = await apiFetch(`/groups/${groupId}/objects/${userObjectId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleDeleteResponse(response);
};

export const searchGroupsCombinedPage = async (
  keyword,
  { size = PAGE_SIZE, page = 0 } = {},
) => {
  const params = buildPageParams({ size, page, keyword });
  const response = await apiFetch(`/groups/search?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const searchGroupObjectsPage = async (
  groupId,
  keyword,
  { size = PAGE_SIZE, page = 0 } = {},
) => {
  const params = buildPageParams({ size, page, keyword });
  const response = await apiFetch(`/groups/${groupId}/objects/search?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

/** Adapt combined group search to infinite-list page shape. */
export async function searchGroupsListPage(keyword, { size = PAGE_SIZE, page = 0 } = {}) {
  const response = await searchGroupsCombinedPage(keyword, { size, page });
  return {
    ...response,
    content: response?.groups ?? [],
    total_elements: response?.total_groups ?? response?.totalGroups ?? 0,
    total_pages: response?.total_pages ?? response?.totalPages ?? 0,
  };
}
