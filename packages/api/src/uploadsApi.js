import { authHeaders, handleResponse, parseApiError, apiFetch } from "./client.js";

/**
 * @param {File | { uri: string, name?: string, type?: string }} file
 */
export async function uploadImage(file) {
  const formData = new FormData();
  if (file && typeof file === "object" && "uri" in file && file.uri) {
    formData.append("file", {
      uri: file.uri,
      name: file.name ?? "photo.jpg",
      type: file.type ?? "image/jpeg",
    });
  } else {
    formData.append("file", file);
  }

  const response = await apiFetch("/uploads/image", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw parseApiError(errorText, "uploadFailed");
  }

  const data = await handleResponse(response);
  return data.url;
}
