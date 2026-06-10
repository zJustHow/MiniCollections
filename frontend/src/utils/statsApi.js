import { authHeaders, handleResponse } from "./apiClient";

export const getCollectionStats = async () => {
  const response = await fetch("/users/me/collection-stats", {
    headers: authHeaders(),
  });
  return handleResponse(response);
};
