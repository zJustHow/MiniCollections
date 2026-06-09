import { act, renderHook, waitFor } from "@testing-library/react";
import useRemoteBrandSelect from "./useRemoteBrandSelect";

vi.mock("../utils/debounce", () => ({
  debounce: (fn) => {
    const wrapped = (...args) => fn(...args);
    wrapped.cancel = vi.fn();
    return wrapped;
  },
}));

vi.mock("../utils", () => ({
  searchBrandsForSelect: vi.fn(),
  getBrandByBrandId: vi.fn(),
}));

import { getBrandByBrandId, searchBrandsForSelect } from "../utils";

describe("useRemoteBrandSelect", () => {
  beforeEach(() => {
    searchBrandsForSelect.mockReset();
    getBrandByBrandId.mockReset();
    searchBrandsForSelect.mockResolvedValue([{ id: 2, name_en: "BMW" }]);
    getBrandByBrandId.mockResolvedValue({ id: 5, name_en: "Kyosho" });
  });

  test("loads initial brand options", async () => {
    const { result } = renderHook(() => useRemoteBrandSelect());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toEqual([{ id: 2, name_en: "BMW", name: "BMW" }]);
    expect(searchBrandsForSelect).toHaveBeenCalledWith("");
  });

  test("searches brands by keyword", async () => {
    const { result } = renderHook(() => useRemoteBrandSelect());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onSearch("mini");
    });

    await waitFor(() => {
      expect(searchBrandsForSelect).toHaveBeenCalledWith("mini");
    });
  });

  test("ensureBrand prepends missing brand option", async () => {
    const { result } = renderHook(() => useRemoteBrandSelect());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.ensureBrand(5);
    });

    expect(getBrandByBrandId).toHaveBeenCalledWith(5);
    expect(result.current.options[0]).toEqual({ id: 5, name_en: "Kyosho", name: "Kyosho" });
  });

  test("clears options when search fails", async () => {
    searchBrandsForSelect.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useRemoteBrandSelect());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toEqual([]);
  });

  test("does not load options when disabled", async () => {
    const { result } = renderHook(() => useRemoteBrandSelect({ enabled: false }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(searchBrandsForSelect).not.toHaveBeenCalled();
    expect(result.current.options).toEqual([]);
  });

  test("seedBrand prepends brand without duplicate", async () => {
    const { result } = renderHook(() => useRemoteBrandSelect());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.seedBrand({ id: 2, name_en: "BMW" });
    });

    expect(result.current.options.filter((brand) => brand.id === 2)).toHaveLength(1);
  });
});
