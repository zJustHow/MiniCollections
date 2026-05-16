const TOKEN_KEY = "auth_token";

export const COUNTRIES = [
  { code: "+86", zh: "中国大陆", en: "China" },
  { code: "+852", zh: "香港", en: "Hong Kong" },
  { code: "+853", zh: "澳门", en: "Macau" },
  { code: "+886", zh: "台湾", en: "Taiwan" },
  { code: "+1", zh: "美国/加拿大", en: "US/Canada" },
  { code: "+44", zh: "英国", en: "UK" },
  { code: "+81", zh: "日本", en: "Japan" },
  { code: "+82", zh: "韩国", en: "South Korea" },
  { code: "+65", zh: "新加坡", en: "Singapore" },
  { code: "+61", zh: "澳大利亚", en: "Australia" },
  { code: "+49", zh: "德国", en: "Germany" },
  { code: "+33", zh: "法国", en: "France" },
  { code: "+7", zh: "俄罗斯", en: "Russia" },
];

export function parsePhone(phone) {
  if (!phone) return { countryCode: "+86", phoneNumber: "" };
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const { code } of sorted) {
    if (phone.startsWith(code)) return { countryCode: code, phoneNumber: phone.slice(code.length) };
  }
  return { countryCode: "+86", phoneNumber: phone };
}

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

let _locale = "en-US";
export function setCurrentLocale(locale) { _locale = locale; }

function authHeaders(extra = {}) {
  const token = getToken();
  const headers = { "Accept-Language": _locale, ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const login = async ({ identifier, password, loginType }) => {
  const body = { password };
  body[loginType === "phone" ? "phone" : "email"] = identifier;
  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await handleResponse(response);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getWechatAuthUrl = async (platform = "pc") => {
  const response = await fetch(`/auth/wechat/url?platform=${platform}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const exchangeWechatCode = async ({ code, state }) => {
  const response = await fetch("/auth/wechat/exchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
  });
  const data = await handleResponse(response);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const bindWechatAccount = async ({ code, state }) => {
  const response = await fetch("/auth/wechat/bind", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ code, state }),
  });
  return handleResponse(response);
};

export const sendCode = async (target, type) => {
  const response = await fetch("/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, type }),
  });
  return handleResponse(response);
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

export const getGroupById = async (groupId) => {
  const response = await fetch(`/groups/${groupId}`, { headers: authHeaders() });
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

export const searchBrandObjectsByBrandId = async (brandId, keyword) => {
  const response = await fetch(
    `/brands/${brandId}/objects/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
};

export const searchBrandsCombined = async (keyword) => {
  const [brands, objects] = await Promise.all([
    searchBrands(keyword),
    searchBrandObjects(keyword),
  ]);
  return { brands, objects };
};

export const getUserObjects = async (groupId) => {
  const response = await fetch(`/groups/${groupId}/objects`, { headers: authHeaders() });
  return handleResponse(response);
};

export const searchGroupObjects = async (groupId, keyword) => {
  const response = await fetch(
    `/groups/${groupId}/objects/search?keyword=${encodeURIComponent(keyword)}`,
    { headers: authHeaders() }
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

export const getMySubmissions = async () => {
  const response = await fetch("/submissions/mine", { headers: authHeaders() });
  return handleResponse(response);
};

export const submitFeedback = async (body) => {
  const response = await fetch("/submissions", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const getAdminSubmissions = async (status) => {
  const url = status ? `/admin/submissions?status=${status}` : "/admin/submissions";
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
};

export const approveSubmission = async (id, body) => {
  const response = await fetch(`/admin/submissions/${id}/approve`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const rejectSubmission = async (id, reason) => {
  const response = await fetch(`/admin/submissions/${id}/reject`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};

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
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
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
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
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
