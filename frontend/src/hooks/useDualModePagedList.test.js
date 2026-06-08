import { renderHook } from "@testing-library/react";
import useDualModePagedList from "./useDualModePagedList";
import usePagedList from "./usePagedList";

vi.mock("./usePagedList");

const mockListPage = {
  items: [{ id: "list" }],
  loading: false,
  loadPage: vi.fn(),
};
const mockSearchPage = {
  items: [{ id: "search" }],
  loading: false,
  loadPage: vi.fn(),
};

describe("useDualModePagedList", () => {
  beforeEach(() => {
    vi.mocked(usePagedList).mockImplementation((_fetchPage, options) => {
      if (!options.enabled) {
        return { items: [], loading: false, loadPage: vi.fn() };
      }
      if (String(options.resetKey).startsWith("object-search")) {
        return mockSearchPage;
      }
      return mockListPage;
    });
  });

  test("uses browse list when search is inactive", () => {
    const { result } = renderHook(() =>
      useDualModePagedList({
        entityKey: "5",
        searchActive: false,
        searchKeyword: "",
        fetchListPage: vi.fn(),
        fetchSearchPage: vi.fn(),
        listResetKey: "objects",
        searchResetKey: "object-search",
        pageSize: 48,
      }),
    );

    expect(result.current.displayObjects).toEqual([{ id: "list" }]);
    expect(result.current.activePage).toBe(result.current.objectsList);
  });

  test("uses search list when search is active", () => {
    const { result } = renderHook(() =>
      useDualModePagedList({
        entityKey: "5",
        searchActive: true,
        searchKeyword: "bmw",
        fetchListPage: vi.fn(),
        fetchSearchPage: vi.fn(),
        listResetKey: "objects",
        searchResetKey: "object-search",
        pageSize: 48,
      }),
    );

    expect(result.current.displayObjects).toEqual([{ id: "search" }]);
    expect(result.current.activePage).toBe(result.current.objectsSearch);
  });
});
