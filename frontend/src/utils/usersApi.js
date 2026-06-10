import { authHeaders, handleDeleteResponse, handleResponse } from "./apiClient";

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

export const deleteAccount = async ({ password } = {}) => {
  const response = await fetch("/users/me", {
    method: "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(password != null ? { password } : {}),
  });
  await handleDeleteResponse(response);
};
