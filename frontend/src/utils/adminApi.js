import { authHeaders, handleDeleteResponse, handleResponse } from "./apiClient";

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
  return handleDeleteResponse(response);
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
  return handleDeleteResponse(response);
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
  return handleDeleteResponse(response);
};

export const adminCreateCategory = async (payload) => {
  const response = await fetch("/admin/categories", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminUpdateCategory = async (id, payload) => {
  const response = await fetch(`/admin/categories/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminDeleteCategory = async (id) => {
  const response = await fetch(`/admin/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleDeleteResponse(response);
};

export const adminCreateScale = async (payload) => {
  const response = await fetch("/admin/scales", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminUpdateScale = async (id, payload) => {
  const response = await fetch(`/admin/scales/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const adminDeleteScale = async (id) => {
  const response = await fetch(`/admin/scales/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleDeleteResponse(response);
};
