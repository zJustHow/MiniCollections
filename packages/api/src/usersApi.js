import {
  authHeaders,
  handleDeleteResponse,
  handleResponse,
  parseApiError,
  apiFetch,
} from "./client.js";

export const getMe = async () => {
  const response = await apiFetch("/users/me", { headers: authHeaders() });
  return handleResponse(response);
};

export const updateProfile = async ({ displayName }) => {
  const response = await apiFetch("/users/me", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ display_name: displayName }),
  });
  return handleResponse(response);
};

export const updatePassword = async ({ currentPassword, newPassword }) => {
  const response = await apiFetch("/users/me/password", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  return handleResponse(response);
};

export const updateIdentifier = async (payload) => {
  const response = await apiFetch("/users/me/identifier", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateLocale = async (preferredLocale) => {
  const response = await apiFetch("/users/me/locale", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ preferred_locale: preferredLocale }),
  });
  return handleResponse(response);
};

/**
 * @param {File | { uri: string, name?: string, type?: string }} file
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  if (file && typeof file === "object" && "uri" in file && file.uri) {
    formData.append("file", {
      uri: file.uri,
      name: file.name ?? "avatar.jpg",
      type: file.type ?? "image/jpeg",
    });
  } else {
    formData.append("file", file);
  }

  const response = await apiFetch("/uploads/users/me/avatar", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText, "avatarUploadFailed");
  }

  return handleResponse(response);
};

export const deleteAccount = async ({ password } = {}) => {
  const response = await apiFetch("/users/me", {
    method: "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(password != null ? { password } : {}),
  });
  await handleDeleteResponse(response);
};
