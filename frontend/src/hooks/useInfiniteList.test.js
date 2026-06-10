import { act, renderHook, waitFor } from "@testing-library/react";
import useInfiniteList from "./useInfiniteList";

describe("useInfiniteList", () => {
  test("loads initial page on mount", async () => {
    const fetchPage = vi.fn(async () => ({
      content: [{ id: 1 }, { id: 2 }],
      total_elements: 2,
    }));

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true, pageSize: 48 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.totalElements).toBe(2);
    expect(result.current.hasMore).toBe(false);
  });

  test("reorderLocalItems sorts items by ordered ids", async () => {
    const fetchPage = vi.fn(async () => ({
      content: [
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ],
      total_elements: 2,
    }));

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.reorderLocalItems([2, 1]);
    });

    expect(result.current.items.map((item) => item.id)).toEqual([2, 1]);
  });

  test("clears items when disabled", async () => {
    const fetchPage = vi.fn(async () => ({
      content: [{ id: 1 }],
      total_elements: 1,
    }));

    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useInfiniteList(fetchPage, { resetKey: "list", enabled }),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);

    rerender({ enabled: false });

    await waitFor(() => {
      expect(result.current.items).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  test("loadMore appends next page", async () => {
    const fetchPage = vi.fn(async ({ page }) => ({
      content: page === 0 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }],
      total_elements: 3,
    }));

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true, pageSize: 2 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => expect(result.current.loadingMore).toBe(false));
    expect(result.current.items.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenCalledWith({ page: 1, size: 2 });
  });

  test("initial load failure exposes loadError", async () => {
    const fetchPage = vi.fn(async () => {
      throw new Error("network");
    });

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
    expect(result.current.totalElements).toBe(0);
    expect(result.current.loadError).toBe(true);
  });

  test("retry reloads after initial failure", async () => {
    const fetchPage = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        content: [{ id: 1 }],
        total_elements: 1,
      });

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true }),
    );

    await waitFor(() => expect(result.current.loadError).toBe(true));

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.loadError).toBe(false);
    expect(result.current.items).toEqual([{ id: 1 }]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  test("loadMore failure keeps existing items and exposes loadMoreError", async () => {
    const fetchPage = vi.fn(async ({ page }) => {
      if (page === 0) {
        return { content: [{ id: 1 }], total_elements: 2 };
      }
      throw new Error("network");
    });

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true, pageSize: 1 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: 1 }]);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => expect(result.current.loadingMore).toBe(false));
    expect(result.current.items).toEqual([{ id: 1 }]);
    expect(result.current.loadMoreError).toBe(true);
  });

  test("reorderLocalItems keeps state when order is unchanged", async () => {
    const fetchPage = vi.fn(async () => ({
      content: [
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ],
      total_elements: 2,
    }));

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    const initialItems = result.current.items;

    act(() => {
      result.current.reorderLocalItems([1, 2]);
    });

    expect(result.current.items).toBe(initialItems);
  });

  test("does not loop when disabled with unstable fetchPage", async () => {
    let renderCount = 0;
    const fetchPage = vi.fn(async () => ({
      content: [{ id: 1 }],
      total_elements: 1,
    }));

    const { result, rerender } = renderHook(
      () => {
        renderCount += 1;
        return useInfiniteList(
          ({ size, page }) => fetchPage({ size, page }),
          { resetKey: "list", enabled: false },
        );
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);

    rerender();
    rerender();
    rerender();

    expect(renderCount).toBeLessThan(10);
  });

  test("refresh reloads first page", async () => {
    const fetchPage = vi.fn(async ({ page }) => ({
      content: page === 0 ? [{ id: 1 }] : [{ id: 2 }],
      total_elements: 2,
    }));

    const { result } = renderHook(() =>
      useInfiniteList(fetchPage, { resetKey: "list", enabled: true, pageSize: 1 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadMore();
    });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    fetchPage.mockClear();

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: 1 }]);
    expect(fetchPage).toHaveBeenCalledWith({ page: 0, size: 1 });
  });

  test("resetKey change reloads list", async () => {
    const fetchPage = vi.fn(async () => ({
      content: [{ id: 1 }],
      total_elements: 1,
    }));

    const { rerender } = renderHook(
      ({ resetKey }) =>
        useInfiniteList(fetchPage, { resetKey, enabled: true }),
      { initialProps: { resetKey: "list-a" } },
    );

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));

    rerender({ resetKey: "list-b" });

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
  });
});
