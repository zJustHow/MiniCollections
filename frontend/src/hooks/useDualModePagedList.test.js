import { renderHook } from "@testing-library/react";
import usePagedList from "./usePagedList";
import useDualModePagedList from "./useDualModePagedList";

vi.mock("./usePagedList");

describe("useDualModePagedList", () => {
  beforeEach(() => {
    vi.mocked(usePagedList).mockImplementation((_fetch, options) => {
      const isSearch = String(options.resetKey || "").includes("search");
      const items = options.enabled
        ? isSearch
          ? [{ id: 2, name: "Search hit" }]
          : [{ id: 1, name: "Browse item" }]
        : [];
      return {
        items,
        page: 0,
        loading: false,
        loadPage: vi.fn(),
        onPageChange: vi.fn(),
      };
    });
  });

  test("uses browse list when search is inactive", () => {
    const { result } = renderHook(() =>
      useDualModePagedList({
        entityKey: "9",
        searchActive: false,
        searchKeyword: "",
        fetchListPage: vi.fn(),
        fetchSearchPage: vi.fn(),
        listResetKey: "brand-objects",
        searchResetKey: "brand-objects-search",
        pageSize: 48,
      }),
    );

    expect(result.current.displayObjects).toEqual([{ id: 1, name: "Browse item" }]);
    expect(result.current.activePage).toBe(result.current.objectsList);
  });

  test("uses search list when search is active", () => {
    const { result } = renderHook(() =>
      useDualModePagedList({
        entityKey: "9",
        searchActive: true,
        searchKeyword: "m3",
        fetchListPage: vi.fn(),
        fetchSearchPage: vi.fn(),
        listResetKey: "brand-objects",
        searchResetKey: "brand-objects-search",
        pageSize: 48,
      }),
    );

    expect(result.current.displayObjects).toEqual([{ id: 2, name: "Search hit" }]);
    expect(result.current.activePage).toBe(result.current.objectsSearch);
  });
});
