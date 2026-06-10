import { renderHook } from "@testing-library/react";
import useInfiniteList from "./useInfiniteList";
import usePagedList from "./usePagedList";
import useDualModeInfiniteList from "./useDualModeInfiniteList";

vi.mock("./useInfiniteList");
vi.mock("./usePagedList");

describe("useDualModeInfiniteList", () => {
  beforeEach(() => {
    vi.mocked(useInfiniteList).mockImplementation((_fetch, options) => ({
      items: options.enabled ? [{ id: 1, name: "Browse item" }] : [],
      loading: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    }));

    vi.mocked(usePagedList).mockImplementation((_fetch, options) => ({
      items: options.enabled ? [{ id: 2, name: "Search hit" }] : [],
      loading: false,
      loadPage: vi.fn(),
      onPageChange: vi.fn(),
    }));
  });

  test("uses browse list when search is inactive", () => {
    const { result } = renderHook(() =>
      useDualModeInfiniteList({
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

    expect(result.current.displayItems).toEqual([{ id: 1, name: "Browse item" }]);
    expect(result.current.activeList).toBe(result.current.browseList);
  });

  test("uses search list when search is active", () => {
    const { result } = renderHook(() =>
      useDualModeInfiniteList({
        entityKey: "9",
        searchActive: true,
        searchKeyword: "bmw",
        fetchListPage: vi.fn(),
        fetchSearchPage: vi.fn(),
        listResetKey: "brand-objects",
        searchResetKey: "brand-objects-search",
        pageSize: 48,
      }),
    );

    expect(result.current.displayItems).toEqual([{ id: 2, name: "Search hit" }]);
    expect(result.current.activeList).toBe(result.current.searchList);
  });
});
