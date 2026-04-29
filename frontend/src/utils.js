const TOKEN_KEY = "auth_token";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(extra = {}) {
  const token = getToken();
  const headers = { ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const login = async (credentials) => {
  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: credentials.username, password: credentials.password }),
  });
  const data = await handleResponse(response);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const signup = async (data) => {
  const response = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getBrands = async () => {
  const response = await fetch("/brands", { headers: authHeaders() });
  return handleResponse(response);
};

export const searchBrands = async (keyword) => {
  const response = await fetch(
    `/brands/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
};

export const getGroups = async () => {
  const response = await fetch("/groups", { headers: authHeaders() });
  return handleResponse(response);
};

export const searchGroups = async (keyword) => {
  const response = await fetch(
    `/groups/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: authHeaders() }
  );
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
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
};

export const getBrandByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getBrandObjectsByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}/objects`, { headers: authHeaders() });
  return handleResponse(response);
};

export const getBrandObjectById = async (id) => {
  const response = await fetch(`/brands/objects/${id}`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchBrandObjects = async (keyword) => {
  const response = await fetch(
    `/brands/objects/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
};

export const getUserObjects = async (groupId) => {
  const response = await fetch(`/groups/${groupId}/objects`, { headers: authHeaders() });
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
    { method: "DELETE", headers: authHeaders() }
  );
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/uploads/image", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Upload failed");
  }
  const data = await response.json();
  return data.url;
};

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

export const purchasePriceFromFormValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return { purchase_price: null };
  }
  const n = typeof value === "string" ? parseFloat(value, 10) : value;
  if (Number.isNaN(n)) {
    return { purchase_price: null };
  }
  return { purchase_price: n };
};

export const displayPurchasePriceFromObject = (obj) => {
  if (!obj) return undefined;
  return obj.purchase_price ?? obj.purchasePrice;
};
