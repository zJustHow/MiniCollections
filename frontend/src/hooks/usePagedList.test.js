import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import usePagedList from "./usePagedList";

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

describe("usePagedList", () => {
  test("loads first page on mount", async () => {
    const fetchPage = vi.fn(async () => ({
      content: [{ id: 1 }],
      page: 0,
      total_elements: 1,
      total_pages: 1,
      total_exact: true,
    }));

    const { result } = renderHook(
      () => usePagedList(fetchPage, { resetKey: "list", enabled: true }),
      { wrapper: createWrapper("/") },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: 1 }]);
    expect(fetchPage).toHaveBeenCalledWith({ page: 0, size: 48 });
  });

  test("reads one-based page param from URL", async () => {
    const fetchPage = vi.fn(async ({ page }) => ({
      content: [{ id: page + 1 }],
      page,
      total_elements: 96,
      total_pages: 2,
      total_exact: true,
    }));

    const { result } = renderHook(
      () =>
        usePagedList(fetchPage, {
          resetKey: "list",
          enabled: true,
          pageParamKey: "page",
        }),
      { wrapper: createWrapper("/?page=2") },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.page).toBe(1);
    expect(fetchPage).toHaveBeenCalledWith({ page: 1, size: 48 });
  });

  test("reset clears items when disabled", async () => {
    const fetchPage = vi.fn(async () => ({
      content: [{ id: 1 }],
      page: 0,
      total_elements: 1,
      total_pages: 1,
    }));

    const { result, rerender } = renderHook(
      ({ enabled }) => usePagedList(fetchPage, { resetKey: "list", enabled }),
      {
        wrapper: createWrapper("/"),
        initialProps: { enabled: true },
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ enabled: false });
    await waitFor(() => {
      expect(result.current.items).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  test("onPageChange loads requested page", async () => {
    const fetchPage = vi.fn(async ({ page }) => ({
      content: [{ id: page }],
      page,
      total_elements: 96,
      total_pages: 2,
      total_exact: true,
    }));

    const { result } = renderHook(
      () =>
        usePagedList(fetchPage, {
          resetKey: "list",
          enabled: true,
          pageParamKey: "page",
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
