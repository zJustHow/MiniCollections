import {
  authHeaders,
  buildPageParams,
  fetchAllPages,
  handleDeleteResponse,
  handleResponse,
  parseApiError,
  setCurrentLocale,
  TOKEN_KEY,
} from "./apiClient";

describe("apiClient", () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentLocale("en-US");
  });

  test("authHeaders includes bearer token and locale", () => {
    localStorage.setItem(TOKEN_KEY, "abc123");
    setCurrentLocale("zh-CN");

    expect(authHeaders()).toEqual({
      "Accept-Language": "zh-CN",
      Authorization: "Bearer abc123",
    });
    expect(authHeaders({ "Content-Type": "application/json" })).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer abc123",
    });
  });

  test("parseApiError localizes JSON error codes", () => {
    const err = parseApiError(
      JSON.stringify({ code: "error.submission.limit", args: [2] }),
    );
    expect(err.message).toContain("2");
    expect(err.code).toBe("error.submission.limit");
    expect(err.args).toEqual([2]);
  });

  test("parseApiError uses plain text when body is not JSON", () => {
    const err = parseApiError("Server exploded");
    expect(err.message).toBe("Server exploded");
    expect(err.code).toBeUndefined();
  });

  test("parseApiError maps empty 401 body to no-permission message", () => {
    const err = parseApiError("", "error.request_failed", 401);
    expect(err.message).toMatch(/permission|权限/i);
  });

  test("handleResponse returns JSON on success", async () => {
    const response = {
      ok: true,
      json: async () => ({ ok: true }),
    };
    await expect(handleResponse(response)).resolves.toEqual({ ok: true });
  });

  test("handleResponse throws localized error on failure", async () => {
    const response = {
      ok: false,
      text: async () =>
        JSON.stringify({ code: "error.request_failed", args: null }),
    };
    await expect(handleResponse(response)).rejects.toThrow(/request failed/i);
  });

  test("handleDeleteResponse accepts 204 without body", async () => {
    await expect(handleDeleteResponse({ status: 204 })).resolves.toBeUndefined();
  });

  test("handleDeleteResponse throws localized error on failure", async () => {
    const response = {
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ code: "error.request_failed", args: null }),
    };
    await expect(handleDeleteResponse(response)).rejects.toThrow(/request failed/i);
  });

  test("buildPageParams encodes keyword and filter ids", () => {
    const params = buildPageParams({
      page: 2,
      size: 24,
      keyword: "bmw",
      categoryIds: [1, 2],
      brandIds: [3],
    });
    expect(params.get("page")).toBe("2");
    expect(params.get("keyword")).toBe("bmw");
    expect(params.getAll("categoryIds")).toEqual(["1", "2"]);
    expect(params.getAll("brandIds")).toEqual(["3"]);
  });

  test("fetchAllPages walks every page", async () => {
    const fetchPage = vi.fn(async ({ page }) => ({
      content: [`item-${page}`],
      total_pages: 2,
    }));

    const all = await fetchAllPages(fetchPage);
    expect(all).toEqual(["item-0", "item-1"]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});
