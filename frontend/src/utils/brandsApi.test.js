import {
  getBrandsPage,
  searchBrandsCombinedPage,
  searchBrandsForSelect,
  searchBrandsPage,
  searchBrandObjectsForSelect,
} from "./brandsApi";
import { TOKEN_KEY } from "./apiClient";

describe("brandsApi", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "token-1");
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ content: [{ id: 1 }], total_pages: 1 }),
    }));
  });

  test("getBrandsPage requests paginated brands", async () => {
    await getBrandsPage({ page: 0, size: 48 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands?");
    expect(url).toContain("size=48");
  });

  test("searchBrandsPage includes keyword", async () => {
    await searchBrandsPage("mini gt", { page: 1, size: 24 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands/search?");
    expect(url).toContain("keyword=mini");
  });

  test("searchBrandsForSelect uses browse endpoint for empty keyword", async () => {
    const items = await searchBrandsForSelect("  ", { page: 0, size: 20 });
    expect(global.fetch.mock.calls[0][0]).toContain("/brands?");
    expect(global.fetch.mock.calls[0][0]).not.toContain("/search");
    expect(items).toEqual([{ id: 1 }]);
  });

  test("searchBrandsForSelect uses search endpoint when keyword present", async () => {
    await searchBrandsForSelect("bmw", { page: 0, size: 20 });
    expect(global.fetch.mock.calls[0][0]).toContain("/brands/search?");
  });

  test("searchBrandsCombinedPage forwards filter ids", async () => {
    await searchBrandsCombinedPage("car", {
      page: 0,
      size: 48,
      categoryIds: [1, 2],
      brandIds: [3],
    });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands/search/combined?");
    expect(url).toContain("categoryIds=1");
    expect(url).toContain("brandIds=3");
  });

  test("searchBrandObjectsForSelect returns empty for blank keyword", async () => {
    const items = await searchBrandObjectsForSelect("  ");
    expect(items).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("searchBrandObjectsFacets includes keyword and filters", async () => {
    const { searchBrandObjectsFacets } = await import("./brandsApi");
    await searchBrandObjectsFacets("bmw", { categoryIds: [1], scaleIds: [64] });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands/objects/search/facets?");
    expect(url).toContain("keyword=bmw");
    expect(url).toContain("categoryIds=1");
    expect(url).toContain("scaleIds=64");
  });

  test("getOrCreateAnonSessionId reuses stored session", async () => {
    const { getOrCreateAnonSessionId } = await import("./brandsApi");
    localStorage.setItem("mc_anon_session", "session-123");
    expect(getOrCreateAnonSessionId()).toBe("session-123");
  });

  test("recordBrandView posts silently", async () => {
    const { recordBrandView } = await import("./brandsApi");
    global.fetch = vi.fn(async () => ({ status: 204 }));
    await recordBrandView(5);
    expect(global.fetch).toHaveBeenCalledWith(
      "/brands/5/views",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
