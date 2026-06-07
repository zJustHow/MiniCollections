import {
  authHeaders,
  buildPageParams,
  handleDeleteResponse,
  handleResponse,
  PAGE_SIZE,
} from "./apiClient";

export const getGroupsPage = async ({ size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await fetch(`/groups?${params}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchGroupsCombinedPage = async (
  keyword,
  { size = PAGE_SIZE, page = 0 } = {},
) => {
  const params = buildPageParams({ size, page, keyword });
  const response = await fetch(`/groups/search?${params}`, { headers: authHeaders() });
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
  return handleDeleteResponse(response);
};

export const getGroupById = async (groupId) => {
  const response = await fetch(`/groups/${groupId}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getUserObjectsPage = async (groupId, { size = PAGE_SIZE, page = 0 } = {}) => {
  const params = buildPageParams({ size, page });
  const response = await fetch(`/groups/${groupId}/objects?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const getUserObjectById = async (groupId, userObjectId) => {
  const response = await fetch(`/groups/${groupId}/objects/${userObjectId}`, {
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
  const response = await fetch(`/groups/${groupId}/objects/search?${params}`, {
    headers: authHeaders(),
  });
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
    { method: "DELETE", headers: authHeaders() },
  );
  return handleDeleteResponse(response);
};
