import { act, renderHook } from "@testing-library/react";
import useObjectListPageSearch from "./useObjectListPageSearch";

describe("useObjectListPageSearch", () => {
  test("activates search when URL keyword is present", () => {
    const { result, rerender } = renderHook(
      ({ searchValue }) =>
        useObjectListPageSearch({
          entityKey: "brand-1",
          searchValue,
          applySearch: vi.fn(),
          clearSearch: vi.fn(),
        }),
      { initialProps: { searchValue: "" } },
    );

    expect(result.current.searchActive).toBe(false);

    rerender({ searchValue: "bmw" });

    expect(result.current.searchActive).toBe(true);
    expect(result.current.searchKeyword).toBe("bmw");
    expect(result.current.draftQuery).toBe("bmw");
  });

  test("runSearch trims keyword and applies search", () => {
    const applySearch = vi.fn();
    const { result } = renderHook(() =>
      useObjectListPageSearch({
        entityKey: "brand-1",
        searchValue: "",
        applySearch,
        clearSearch: vi.fn(),
      }),
    );

    act(() => {
      result.current.runSearch("  m3  ");
    });

    expect(applySearch).toHaveBeenCalledWith("m3");
    expect(result.current.searchKeyword).toBe("m3");
    expect(result.current.searchActive).toBe(true);
  });

  test("runSearch with empty keyword clears search", () => {
    const clearSearch = vi.fn();
    const { result } = renderHook(() =>
      useObjectListPageSearch({
        entityKey: "brand-1",
        searchValue: "bmw",
        applySearch: vi.fn(),
        clearSearch,
      }),
    );

    act(() => {
      result.current.runSearch("");
    });

    expect(clearSearch).toHaveBeenCalled();
    expect(result.current.searchActive).toBe(false);
    expect(result.current.searchKeyword).toBe("");
  });
});
