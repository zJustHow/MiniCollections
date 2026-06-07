import { authHeaders, handleResponse, parseApiError } from "./apiClient";

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
    throw parseApiError(errorText, "uploadFailed");
  }
  const data = await response.json();
  return data.url;
};

/** Remove a user upload from MinIO (cancel / remove before save). Safe to ignore failures. */
export const discardUploadedImage = async (url) => {
  if (!url) return;
  const response = await fetch(
    `/uploads/image?${new URLSearchParams({ url })}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (response.status === 204) return;
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText);
  }
};

export const uploadBrandLogo = async (brandId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`/admin/brands/${brandId}/logo`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText, "uploadFailed");
  }
  return handleResponse(response);
};
