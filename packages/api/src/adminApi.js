import { authHeaders, handleDeleteResponse, handleResponse, apiFetch } from "./client.js";

export async function adminCreateBrand(payload) {
  const response = await apiFetch("/admin/brands", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function adminUpdateBrand(id, payload) {
  const response = await apiFetch(`/admin/brands/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function adminDeleteBrand(id) {
  const response = await apiFetch(`/admin/brands/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleDeleteResponse(response);
}

export async function adminCreateBrandObject(brandId, payload) {
  const response = await apiFetch(`/admin/brands/${brandId}/objects`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function adminUpdateBrandObject(id, payload) {
  const response = await apiFetch(`/admin/brands/objects/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function adminDeleteBrandObject(id) {
  const response = await apiFetch(`/admin/brands/objects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleDeleteResponse(response);
}
