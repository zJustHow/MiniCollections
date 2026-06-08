import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useCombinedBrandSearch from "./useCombinedBrandSearch";

vi.mock("../utils/scroll", () => ({
  scrollAppToTop: vi.fn(),
}));

function createWrapper(initialEntry = "/") {
  return function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe("useCombinedBrandSearch", () => {
  test("loads combined results on mount", async () => {
    const fetchPage = vi.fn(async () => ({
      brands: [{ id: 1 }],
      objects: [{ id: 2 }],
      page: 0,
      total_brands: 1,
      total_objects: 1,
      total_elements: 2,
      total_pages: 1,
      total_exact: true,
    }));

    const { result } = renderHook(
      () =>
        useCombinedBrandSearch(fetchPage, {
          resetKey: "search",
          enabled: true,
        }),
      { wrapper: createWrapper("/") },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.brands).toEqual([{ id: 1 }]);
    expect(result.current.objects).toEqual([{ id: 2 }]);
  });

  test("does not fetch when disabled", async () => {
    const fetchPage = vi.fn(async () => ({
      brands: [],
      objects: [],
      page: 0,
      total_elements: 0,
      total_pages: 0,
    }));

    const { result } = renderHook(
      () =>
        useCombinedBrandSearch(fetchPage, {
          resetKey: "search",
          enabled: false,
        }),
      { wrapper: createWrapper("/") },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchPage).not.toHaveBeenCalled();
    expect(result.current.brands).toEqual([]);
  });

  test("onPageChange requests next page", async () => {
    const fetchPage = vi.fn(async ({ page }) => ({
      brands: [{ id: page }],
      objects: [],
      page,
      total_elements: 96,
      total_pages: 2,
      total_exact: true,
    }));

    const { result } = renderHook(
      () =>
        useCombinedBrandSearch(fetchPage, {
          resetKey: "search",
          enabled: true,
          pageParamKey: "searchPage",
        }),
      { wrapper: createWrapper("/") },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.onPageChange(2);
    });

    await waitFor(() => expect(result.current.page).toBe(1));
    expect(fetchPage).toHaveBeenLastCalledWith({ page: 1, size: 48 });
  });
});
