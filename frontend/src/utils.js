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
  const loginUrl = `/login?username=${credentials.username}&password=${credentials.password}`;
  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
};

export const signup = async (data) => {
  const response = await fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const getBrands = async () => {
  const response = await fetch("/brands");
  return handleResponse(response);
};

export const getGroups = async () => {
  const response = await fetch("/groups");
  return handleResponse(response);
};

export const getBrandByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}`);
  return handleResponse(response);
};

export const getBrandObjectsByBrandId = async (brandId) => {
  const response = await fetch(`/brands/${brandId}/objects`);
  return handleResponse(response);
};

export const getBrandObjectById = async (id) => {
  const response = await fetch(`/brand_objects/${id}`);
  return handleResponse(response);
};

export const createUserObject = async (groupId, payload) => {
  const response = await fetch(`/groups/${groupId}/objects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};