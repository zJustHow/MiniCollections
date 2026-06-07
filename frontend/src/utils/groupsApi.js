import { authHeaders, buildPageParams, handleDeleteResponse, handleResponse } from "./apiClient";

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
  return handleDeleteResponse(response);
};

export const getGroupById = async (groupId) => {
  const response = await fetch(`/groups/${groupId}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getUserObjects = async (groupId) => {
  const response = await fetch(`/groups/${groupId}/objects`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchGroupObjects = async (groupId, keyword) => {
  const response = await fetch(
    `/groups/${groupId}/objects/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: authHeaders() },
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
    { method: "DELETE", headers: authHeaders() },
  );
  return handleDeleteResponse(response);
};
