import { authHeaders, FEEDBACK_PAGE_SIZE, handleResponse } from "./apiClient";

export const getMySubmissionsPage = async ({ size = FEEDBACK_PAGE_SIZE, page = 0 } = {}) => {
  const params = new URLSearchParams({ size: String(size), page: String(page) });
  const response = await fetch(`/submissions/mine?${params}`, { headers: authHeaders() });
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

export const deleteMySubmission = async (id) => {
  const response = await fetch(`/submissions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const getAdminSubmissionCounts = async () => {
  const response = await fetch("/admin/submissions/counts", { headers: authHeaders() });
  return handleResponse(response);
};

export const getAdminSubmissionsPage = async ({ status, page = 0, size = FEEDBACK_PAGE_SIZE } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status && status !== "ALL") {
    params.set("status", status);
  }
  const response = await fetch(`/admin/submissions?${params}`, { headers: authHeaders() });
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
