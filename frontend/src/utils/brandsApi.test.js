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

  test("getBrandByBrandId fetches single brand", async () => {
    const { getBrandByBrandId } = await import("./brandsApi");
    await getBrandByBrandId(9);
    expect(global.fetch.mock.calls[0][0]).toBe("/brands/9");
  });

  test("getBrandObjectsPage requests brand objects", async () => {
    const { getBrandObjectsPage } = await import("./brandsApi");
    await getBrandObjectsPage(9, { page: 1, size: 24 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands/9/objects?");
    expect(url).toContain("page=1");
  });

  test("searchBrandObjectsPage includes keyword and filters", async () => {
    const { searchBrandObjectsPage } = await import("./brandsApi");
    await searchBrandObjectsPage("m3", { brandIds: [2], page: 0, size: 48 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands/objects/search?");
    expect(url).toContain("keyword=m3");
    expect(url).toContain("brandIds=2");
  });

  test("searchBrandObjectsByBrandIdPage scopes search to brand", async () => {
    const { searchBrandObjectsByBrandIdPage } = await import("./brandsApi");
    await searchBrandObjectsByBrandIdPage(9, "m3", { page: 0, size: 24 });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands/9/objects/search?");
    expect(url).toContain("keyword=m3");
  });

  test("searchBrandObjectsByBrandIdFacets requests scoped facets", async () => {
    const { searchBrandObjectsByBrandIdFacets } = await import("./brandsApi");
    await searchBrandObjectsByBrandIdFacets(9, "bmw", { scaleIds: [64] });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/brands/9/objects/search/facets?");
    expect(url).toContain("keyword=bmw");
    expect(url).toContain("scaleIds=64");
  });

  test("recordModelView posts silently", async () => {
    const { recordModelView } = await import("./brandsApi");
    global.fetch = vi.fn(async () => ({ status: 204 }));
    await recordModelView(42);
    expect(global.fetch).toHaveBeenCalledWith(
      "/brands/objects/42/views",
      expect.objectContaining({ method: "POST" }),
    );
  });

  test("getOrCreateAnonSessionId creates and stores new session", async () => {
    const { getOrCreateAnonSessionId } = await import("./brandsApi");
    localStorage.removeItem("mc_anon_session");
    vi.stubGlobal("crypto", { randomUUID: () => "generated-session" });

    expect(getOrCreateAnonSessionId()).toBe("generated-session");
    expect(localStorage.getItem("mc_anon_session")).toBe("generated-session");

    vi.unstubAllGlobals();
  });

  test("getCategories fetches categories", async () => {
    const { getCategories } = await import("./brandsApi");
    await getCategories();
    expect(global.fetch.mock.calls[0][0]).toBe("/categories");
  });

  test("getScales fetches scales", async () => {
    const { getScales } = await import("./brandsApi");
    await getScales();
    expect(global.fetch.mock.calls[0][0]).toBe("/scales");
  });

  test("getSeriesByBrandId fetches brand series", async () => {
    const { getSeriesByBrandId } = await import("./brandsApi");
    await getSeriesByBrandId(9);
    expect(global.fetch.mock.calls[0][0]).toBe("/brands/9/series");
  });

  test("getBrandObjectById fetches object detail", async () => {
    const { getBrandObjectById } = await import("./brandsApi");
    await getBrandObjectById(42);
    expect(global.fetch.mock.calls[0][0]).toBe("/brands/objects/42");
  });

  test("searchBrandsCombined unwraps brands and objects", async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        brands: [{ id: 1 }],
        objects: [{ id: 2 }],
      }),
    }));
    const { searchBrandsCombined } = await import("./brandsApi");
    const result = await searchBrandsCombined("bmw");
    expect(result).toEqual({
      brands: [{ id: 1 }],
      objects: [{ id: 2 }],
    });
  });

  test("getBrands fetches all brand pages", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 1 }], total_pages: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 2 }], total_pages: 2 }),
      });
    const { getBrands } = await import("./brandsApi");
    const all = await getBrands();
    expect(all).toEqual([{ id: 1 }, { id: 2 }]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("searchBrands fetches all search result pages", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 3 }], total_pages: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 4 }], total_pages: 2 }),
      });
    const { searchBrands } = await import("./brandsApi");
    const all = await searchBrands("mini");
    expect(all).toEqual([{ id: 3 }, { id: 4 }]);
    expect(global.fetch.mock.calls[0][0]).toContain("/brands/search?");
  });

  test("getBrandObjectsByBrandId fetches all object pages", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 10 }], total_pages: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 11 }], total_pages: 2 }),
      });
    const { getBrandObjectsByBrandId } = await import("./brandsApi");
    const all = await getBrandObjectsByBrandId(9);
    expect(all).toEqual([{ id: 10 }, { id: 11 }]);
    expect(global.fetch.mock.calls[0][0]).toContain("/brands/9/objects?");
  });

  test("searchBrandObjects fetches all global object search pages", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 20 }], total_pages: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 21 }], total_pages: 2 }),
      });
    const { searchBrandObjects } = await import("./brandsApi");
    const all = await searchBrandObjects("m3");
    expect(all).toEqual([{ id: 20 }, { id: 21 }]);
    expect(global.fetch.mock.calls[0][0]).toContain("/brands/objects/search?");
  });

  test("searchBrandObjectsByBrandId fetches all scoped search pages", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 30 }], total_pages: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ id: 31 }], total_pages: 2 }),
      });
    const { searchBrandObjectsByBrandId } = await import("./brandsApi");
    const all = await searchBrandObjectsByBrandId(9, "m3");
    expect(all).toEqual([{ id: 30 }, { id: 31 }]);
    expect(global.fetch.mock.calls[0][0]).toContain("/brands/9/objects/search?");
  });
});
