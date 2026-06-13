import { authHeaders, handleResponse, apiFetch } from "./client.js";

export const getCollectionStats = async () => {
  const response = await apiFetch("/users/me/collection-stats", {
    headers: authHeaders(),
  });
  return handleResponse(response);
};
