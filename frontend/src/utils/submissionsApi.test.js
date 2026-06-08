import {
  approveSubmission,
  deleteMySubmission,
  getAdminSubmissionCounts,
  getAdminSubmissionsPage,
  getMySubmissionsPage,
  rejectSubmission,
  submitFeedback,
} from "./submissionsApi";
import { TOKEN_KEY } from "./apiClient";

describe("submissionsApi", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "token-1");
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true }),
    }));
  });

  test("getMySubmissionsPage requests paginated mine endpoint", async () => {
    await getMySubmissionsPage({ page: 1, size: 12 });

    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/submissions/mine");
    expect(url).toContain("page=1");
    expect(url).toContain("size=12");
  });

  test("submitFeedback posts JSON body", async () => {
    const body = { submissionType: "FEEDBACK", notes: "hello" };
    await submitFeedback(body);

    expect(global.fetch).toHaveBeenCalledWith(
      "/submissions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  test("deleteMySubmission sends DELETE", async () => {
    await deleteMySubmission(9);
    expect(global.fetch).toHaveBeenCalledWith(
      "/submissions/9",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  test("getAdminSubmissionCounts hits counts endpoint", async () => {
    await getAdminSubmissionCounts();
    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/submissions/counts",
      expect.any(Object),
    );
  });

  test("getAdminSubmissionsPage omits ALL status filter", async () => {
    await getAdminSubmissionsPage({ status: "ALL", page: 0, size: 24 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toBe("/admin/submissions?page=0&size=24");
    expect(url).not.toContain("status=");
  });

  test("getAdminSubmissionsPage includes explicit status", async () => {
    await getAdminSubmissionsPage({ status: "PENDING", page: 2, size: 10 });
    expect(global.fetch.mock.calls[0][0]).toBe(
      "/admin/submissions?page=2&size=10&status=PENDING",
    );
  });

  test("approveSubmission posts approval payload", async () => {
    const body = { brandId: 1, nameEn: "Model" };
    await approveSubmission(5, body);

    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/submissions/5/approve",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  test("rejectSubmission posts reason", async () => {
    await rejectSubmission(6, "duplicate");
    expect(global.fetch).toHaveBeenCalledWith(
      "/admin/submissions/6/reject",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "duplicate" }),
      }),
    );
  });
});
