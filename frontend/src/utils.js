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

export const login = async (credentials) => {
  // Spring Security form login expects application/x-www-form-urlencoded
  const body = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
  }).toString();
  const response = await fetch("/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return handleResponse(response);
};

export const signup = async (data) => {
  const response = await fetch("/signup", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const getBrands = async () => {
  const response = await fetch("/brands", { credentials: "include" });
  return handleResponse(response);
};

export const searchBrands = async (keyword) => {
  const response = await fetch(
    `/brands/search?keyword=${encodeURIComponent(keyword)}`,
    { credentials: "include" }
  );
  return handleResponse(response);
};

export const getGroups = async () => {
  const response = await fetch("/groups", { credentials: "include" });
  return handleResponse(response);
};

export const searchGroups = async (keyword) => {
  const response = await fetch(
    `/groups/search?keyword=${encodeURIComponent(keyword)}`,
    { credentials: "include" }
  );
  return handleResponse(response);
};

export const createGroup = async (payload) => {
  const response = await fetch("/groups", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateGroup = async (groupId, payload) => {
  const response = await fetch(`/groups/${groupId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteGroup = async (groupId) => {
  const response = await fetch(`/groups/${groupId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
};

export const getBrandByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const getBrandObjectsByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}/objects`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const getBrandObjectById = async (id) => {
  const response = await fetch(`/brand_objects/${id}`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const searchBrandObjects = async (keyword) => {
  const response = await fetch(
    `/brand_objects/search?keyword=${encodeURIComponent(keyword)}`,
    { credentials: "include" }
  );
  return handleResponse(response);
};

export const getUserObjects = async (groupId) => {
  const response = await fetch(`/groups/${groupId}/objects`, {
    credentials: "include",
  });
  return handleResponse(response);
};

export const createUserObject = async (groupId, payload) => {
  const response = await fetch(`/groups/${groupId}/objects`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateUserObject = async (groupId, userObjectId, payload) => {
  const response = await fetch(`/groups/${groupId}/objects/${userObjectId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteUserObject = async (groupId, userObjectId) => {
  const response = await fetch(
    `/groups/${groupId}/objects/${userObjectId}`,
    { method: "DELETE", credentials: "include" }
  );
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }
};