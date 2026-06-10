import { renderHook } from "@testing-library/react";
import usePagedList from "./usePagedList";
import useOrderableInfiniteBrowse from "./useOrderableInfiniteBrowse";
import useDualModeBrowseList from "./useDualModeBrowseList";

vi.mock("./usePagedList");
vi.mock("./useOrderableInfiniteBrowse");

describe("useDualModeBrowseList", () => {
  beforeEach(() => {
    vi.mocked(useOrderableInfiniteBrowse).mockImplementation((_options) => ({
      displayItems: [{ id: 1, name: "Browse item" }],
      items: [{ id: 1, name: "Browse item" }],
      loading: false,
      loadMore: vi.fn(),
      handleDragEnd: vi.fn(),
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
      useDualModeBrowseList({
        entityKey: "3",
        searchActive: false,
        searchKeyword: "",
        fetchListPage: vi.fn(),
        fetchSearchPage: vi.fn(),
        fetchOrder: vi.fn(),
        reorder: vi.fn(),
        listResetKey: "group-objects",
        searchResetKey: "group-objects-search",
        pageSize: 48,
      }),
    );

    expect(result.current.displayItems).toEqual([{ id: 1, name: "Browse item" }]);
    expect(result.current.activeList).toBe(result.current.browseList);
  });

  test("uses search list when search is active", () => {
    const { result } = renderHook(() =>
      useDualModeBrowseList({
        entityKey: "3",
        searchActive: true,
        searchKeyword: "bmw",
        fetchListPage: vi.fn(),
        fetchSearchPage: vi.fn(),
        fetchOrder: vi.fn(),
        reorder: vi.fn(),
        listResetKey: "group-objects",
        searchResetKey: "group-objects-search",
        pageSize: 48,
      }),
    );

    expect(result.current.displayItems).toEqual([{ id: 2, name: "Search hit" }]);
    expect(result.current.activeList).toBe(result.current.searchList);
  });
});
