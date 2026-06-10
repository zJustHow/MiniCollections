import { act, renderHook, waitFor } from "@testing-library/react";
import useOrderableInfiniteBrowse from "./useOrderableInfiniteBrowse";

const infiniteState = vi.hoisted(() => ({
  items: [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ],
  reorderLocalItems: vi.fn(),
  refresh: vi.fn(async () => {}),
  loading: false,
  loadingMore: false,
  hasMore: false,
  totalElements: 2,
  loadMore: vi.fn(),
  setItems: vi.fn(),
}));

vi.mock("./useInfiniteList", () => ({
  default: vi.fn(() => infiniteState),
}));

describe("useOrderableInfiniteBrowse", () => {
  beforeEach(() => {
    infiniteState.items = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];
    infiniteState.reorderLocalItems.mockReset();
    infiniteState.refresh.mockReset();
    infiniteState.refresh.mockResolvedValue(undefined);
  });

  test("loads order and exposes sorted displayItems", async () => {
    const fetchOrder = vi.fn(async () => ({ ids: [2, 1] }));
    const reorder = vi.fn();

    const { result } = renderHook(() =>
      useOrderableInfiniteBrowse({
        entityKey: "groups",
        enabled: true,
        fetchPage: vi.fn(),
        fetchOrder,
        reorder,
        pageSize: 48,
      }),
    );

    await waitFor(() => expect(result.current.orderLoading).toBe(false));
    expect(fetchOrder).toHaveBeenCalled();
    expect(infiniteState.reorderLocalItems).toHaveBeenCalledWith([2, 1]);
    expect(result.current.displayItems.map((item) => item.id)).toEqual([2, 1]);
    expect(result.current.sortEnabled).toBe(true);
  });

  test("handleDragEnd persists reorder on success", async () => {
    const fetchOrder = vi.fn(async () => ({ ids: [1, 2] }));
    const reorder = vi.fn(async () => {});

    const { result } = renderHook(() =>
      useOrderableInfiniteBrowse({
        entityKey: "groups",
        enabled: true,
        fetchPage: vi.fn(),
        fetchOrder,
        reorder,
        pageSize: 48,
      }),
    );

    await waitFor(() => expect(result.current.orderLoading).toBe(false));

    let dragResult;
    await act(async () => {
      dragResult = await result.current.handleDragEnd(1, 2);
    });

    expect(dragResult).toBe(true);
    expect(reorder).toHaveBeenCalledWith([2, 1]);
    expect(result.current.orderedIds).toEqual([2, 1]);
  });

  test("does not reload order when fetchOrder identity changes", async () => {
    const fetchOrder = vi.fn(async () => ({ ids: [1, 2] }));

    const { rerender } = renderHook(
      ({ fetchOrderFn }) =>
        useOrderableInfiniteBrowse({
          entityKey: "groups",
          enabled: true,
          fetchPage: vi.fn(),
          fetchOrder: fetchOrderFn,
          reorder: vi.fn(),
          pageSize: 48,
        }),
      { initialProps: { fetchOrderFn: fetchOrder } },
    );

    await waitFor(() => expect(fetchOrder).toHaveBeenCalledTimes(1));

    rerender({ fetchOrderFn: vi.fn(async () => ({ ids: [1, 2] })) });
    rerender({ fetchOrderFn: vi.fn(async () => ({ ids: [1, 2] })) });

    await waitFor(() => expect(fetchOrder).toHaveBeenCalledTimes(1));
  });

  test("handleDragEnd rolls back when reorder fails", async () => {
    const fetchOrder = vi.fn(async () => ({ ids: [1, 2] }));
    const reorder = vi.fn(async () => {
      throw new Error("network");
    });

    const { result } = renderHook(() =>
      useOrderableInfiniteBrowse({
        entityKey: "groups",
        enabled: true,
        fetchPage: vi.fn(),
        fetchOrder,
        reorder,
        pageSize: 48,
      }),
    );

    await waitFor(() => expect(result.current.orderLoading).toBe(false));

    let dragResult;
    await act(async () => {
      dragResult = await result.current.handleDragEnd(1, 2);
    });

    expect(dragResult).toBe(false);
    expect(result.current.orderedIds).toEqual([1, 2]);
    expect(infiniteState.reorderLocalItems).toHaveBeenLastCalledWith([1, 2]);
  });

  test("refreshAll reloads order and list", async () => {
    const fetchOrder = vi.fn(async () => ({ ids: [1, 2] }));

    const { result } = renderHook(() =>
      useOrderableInfiniteBrowse({
        entityKey: "groups",
        enabled: true,
        fetchPage: vi.fn(),
        fetchOrder,
        reorder: vi.fn(),
        pageSize: 48,
      }),
    );

    await waitFor(() => expect(result.current.orderLoading).toBe(false));

    await act(async () => {
      await result.current.refreshAll();
    });

    expect(fetchOrder).toHaveBeenCalledTimes(2);
    expect(infiniteState.refresh).toHaveBeenCalledTimes(1);
  });

  test("falls back to item ids when fetchOrder fails", async () => {
    const fetchOrder = vi.fn(async () => {
      throw new Error("order failed");
    });

    const { result } = renderHook(() =>
      useOrderableInfiniteBrowse({
        entityKey: "groups",
        enabled: true,
        fetchPage: vi.fn(),
        fetchOrder,
        reorder: vi.fn(),
        pageSize: 48,
      }),
    );

    await waitFor(() => expect(result.current.orderLoading).toBe(false));
    expect(fetchOrder).toHaveBeenCalled();
    expect(infiniteState.reorderLocalItems).not.toHaveBeenCalled();
    expect(result.current.orderedIds).toEqual([1, 2]);
    expect(result.current.displayItems).toEqual(infiniteState.items);
  });

  test("disables sorting when browse is disabled", async () => {
    const fetchOrder = vi.fn(async () => ({ ids: [2, 1] }));

    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useOrderableInfiniteBrowse({
          entityKey: "groups",
          enabled,
          fetchPage: vi.fn(),
          fetchOrder,
          reorder: vi.fn(),
          pageSize: 48,
        }),
      { initialProps: { enabled: true } },
    );

    await waitFor(() => expect(result.current.orderLoading).toBe(false));
    expect(result.current.sortEnabled).toBe(true);

    rerender({ enabled: false });

    await waitFor(() => {
      expect(result.current.sortEnabled).toBe(false);
    });
  });
});
