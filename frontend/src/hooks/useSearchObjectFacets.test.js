import { renderHook, waitFor } from "@testing-library/react";
import useSearchObjectFacets from "./useSearchObjectFacets";
import { EMPTY_SEARCH_FACETS } from "../utils/objectFilterUtils";

describe("useSearchObjectFacets", () => {
  test("clears facets when disabled", async () => {
    const fetchFacets = vi.fn(async () => ({
      total: 5,
      categories: [{ id: 1 }],
      brands: [],
      scales: [],
      series: [],
    }));

    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useSearchObjectFacets({
          enabled,
          fetchFacets,
          deps: ["bmw"],
        }),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => expect(result.current.facetsLoading).toBe(false));
    expect(result.current.searchFacets).toEqual({
      total: 5,
      categories: [{ id: 1 }],
      brands: [],
      scales: [],
      series: [],
    });

    rerender({ enabled: false });
    await waitFor(() => expect(result.current.searchFacets).toBeNull());
  });

  test("falls back to empty facets on error", async () => {
    const fetchFacets = vi.fn(async () => {
      throw new Error("network");
    });

    const { result } = renderHook(() =>
      useSearchObjectFacets({
        enabled: true,
        fetchFacets,
        deps: ["fail"],
      }),
    );

    await waitFor(() => expect(result.current.facetsLoading).toBe(false));
    expect(result.current.searchFacets).toEqual(EMPTY_SEARCH_FACETS);
  });
});
