import { act, renderHook, waitFor } from "@testing-library/react";
import useRemoteModelSelectSearch from "./useRemoteModelSelectSearch";

vi.mock("../utils/debounce", () => ({
  debounce: (fn) => {
    const wrapped = (...args) => fn(...args);
    wrapped.cancel = vi.fn();
    return wrapped;
  },
}));

vi.mock("../utils", () => ({
  searchBrandObjectsForSelect: vi.fn(),
}));

import { searchBrandObjectsForSelect } from "../utils";

describe("useRemoteModelSelectSearch", () => {
  test("clears results for blank keyword", async () => {
    const { result } = renderHook(() => useRemoteModelSelectSearch());

    await act(async () => {
      result.current.onSearch("   ");
    });

    expect(result.current.results).toEqual([]);
    expect(searchBrandObjectsForSelect).not.toHaveBeenCalled();
  });

  test("loads search results for keyword", async () => {
    searchBrandObjectsForSelect.mockResolvedValue([{ id: 1, name: "M3" }]);
    const { result } = renderHook(() => useRemoteModelSelectSearch());

    act(() => {
      result.current.onSearch("m3");
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual([{ id: 1, name: "M3" }]);
    expect(searchBrandObjectsForSelect).toHaveBeenCalledWith("m3");
  });

  test("calls onError when search fails", async () => {
    const onError = vi.fn();
    searchBrandObjectsForSelect.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useRemoteModelSelectSearch({ onError }));

    act(() => {
      result.current.onSearch("bmw");
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(onError).toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });
});
