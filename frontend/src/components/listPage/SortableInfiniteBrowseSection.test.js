import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortableInfiniteBrowseSection from "./SortableInfiniteBrowseSection";

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragEnd }) => (
    <div data-testid="dnd-context">
      <button
        type="button"
        data-testid="simulate-drag"
        onClick={() => onDragEnd({ active: { id: 1 }, over: { id: 2 } })}
      >
        drag
      </button>
      <button
        type="button"
        data-testid="simulate-drag-skeleton"
        onClick={() =>
          onDragEnd({
            active: { id: 1 },
            over: { id: "__load-more-skeleton-0" },
          })
        }
      >
        drag skeleton
      </button>
      {children}
    </div>
  ),
  DragOverlay: ({ children }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  KeyboardSensor: class {},
  MouseSensor: class {},
  TouchSensor: class {},
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
  rectSortingStrategy: {},
  sortableKeyboardCoordinates: vi.fn(),
}));

vi.mock("./ObjectBrowseSection", () => ({
  default: ({ children, loading, loadingMore }) =>
    loading ? (
      <div data-testid="browse-loading" />
    ) : (
      <div data-testid="browse-grid" data-loading-more={loadingMore ? "true" : "false"}>
        {children}
      </div>
    ),
}));

vi.mock("./InfiniteScrollSkeletonCards", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: ({ variant, sortEnabled }) => (
      <div
        data-testid="load-more-skeletons"
        data-variant={variant}
        data-sort-enabled={sortEnabled ? "true" : "false"}
      />
    ),
  };
});

vi.mock("./InfiniteScrollSentinel", () => ({
  default: ({ enabled, onLoadMore }) =>
    enabled ? (
      <button type="button" data-testid="load-more" onClick={onLoadMore}>
        load more
      </button>
    ) : null,
}));

vi.mock("../NoDataPlaceholder", () => ({
  default: () => <div data-testid="no-data-placeholder" />,
}));

vi.mock("../ListLoadError", () => ({
  default: ({ message, onRetry }) => (
    <div data-testid="load-error">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" data-testid="retry" onClick={onRetry}>
          retry
        </button>
      ) : null}
    </div>
  ),
}));

describe("SortableInfiniteBrowseSection", () => {
  test("renders browse items when not loading", () => {
    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[{ id: 1, name: "Model A" }]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1]}
        sortEnabled
        onDragEnd={vi.fn()}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    expect(screen.getByText("Model A")).toBeInTheDocument();
  });

  test("shows loading state while order is loading", () => {
    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading
        items={[{ id: 1, name: "Model A" }]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1]}
        sortEnabled
        onDragEnd={vi.fn()}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    expect(screen.getByTestId("browse-loading")).toBeInTheDocument();
    expect(screen.queryByText("Model A")).not.toBeInTheDocument();
  });

  test("shows unified empty state when there are no items", () => {
    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[]}
        renderItem={() => null}
        sortableIds={[]}
        sortEnabled={false}
        onDragEnd={vi.fn()}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    expect(screen.getByTestId("no-data-placeholder")).toBeInTheDocument();
    expect(screen.queryByTestId("browse-grid")).not.toBeInTheDocument();
  });

  test("forwards drag end ids to callback", async () => {
    const onDragEnd = vi.fn();

    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[
          { id: 1, name: "A" },
          { id: 2, name: "B" },
        ]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1, 2]}
        sortEnabled
        onDragEnd={onDragEnd}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByTestId("simulate-drag"));
    expect(onDragEnd).toHaveBeenCalledWith(1, 2);
  });

  test("calls onLoadMore from infinite scroll sentinel", async () => {
    const onLoadMore = vi.fn();

    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[{ id: 1, name: "Model A" }]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1]}
        sortEnabled
        onDragEnd={vi.fn()}
        hasMore
        loadingMore={false}
        onLoadMore={onLoadMore}
      />,
    );

    await userEvent.click(screen.getByTestId("load-more"));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test("shows load error with retry instead of empty state", async () => {
    const onRetry = vi.fn();

    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[]}
        renderItem={() => null}
        sortableIds={[]}
        sortEnabled={false}
        onDragEnd={vi.fn()}
        hasMore={false}
        loadingMore={false}
        onLoadMore={vi.fn()}
        loadError
        errorMessage="failedToLoadGroups"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByTestId("load-error")).toBeInTheDocument();
    expect(screen.getByText("failedToLoadGroups")).toBeInTheDocument();
    expect(screen.queryByTestId("no-data-placeholder")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("shows load-more error with retry", async () => {
    const onRetryLoadMore = vi.fn();

    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[{ id: 1, name: "Model A" }]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1]}
        sortEnabled
        onDragEnd={vi.fn()}
        hasMore
        loadingMore={false}
        onLoadMore={vi.fn()}
        loadMoreError
        onRetryLoadMore={onRetryLoadMore}
      />,
    );

    expect(screen.getByTestId("load-error")).toBeInTheDocument();
    expect(screen.queryByTestId("load-more")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("retry"));
    expect(onRetryLoadMore).toHaveBeenCalledTimes(1);
  });

  test("appends skeleton cards inside browse grid while loading more", () => {
    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[{ id: 1, name: "Model A" }]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1]}
        sortEnabled
        onDragEnd={vi.fn()}
        hasMore
        loadingMore
        onLoadMore={vi.fn()}
        skeletonVariant="object"
      />,
    );

    expect(screen.getByText("Model A")).toBeInTheDocument();
    expect(screen.getByTestId("load-more-skeletons")).toHaveAttribute(
      "data-variant",
      "object",
    );
    expect(screen.getByTestId("browse-grid")).toHaveAttribute(
      "data-loading-more",
      "true",
    );
  });

  test("maps skeleton drop target to the last loaded item", async () => {
    const onDragEnd = vi.fn();

    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[
          { id: 1, name: "A" },
          { id: 2, name: "B" },
        ]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1, 2]}
        sortEnabled
        onDragEnd={onDragEnd}
        hasMore
        loadingMore
        onLoadMore={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByTestId("simulate-drag-skeleton"));
    expect(onDragEnd).toHaveBeenCalledWith(1, 2);
  });

  test("passes sortEnabled to load-more skeletons", () => {
    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[{ id: 1, name: "Model A" }]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1]}
        sortEnabled
        onDragEnd={vi.fn()}
        hasMore
        loadingMore
        onLoadMore={vi.fn()}
      />,
    );

    expect(screen.getByTestId("load-more-skeletons")).toHaveAttribute(
      "data-sort-enabled",
      "true",
    );
  });

  test("does not render load-more skeletons when not loading more", () => {
    render(
      <SortableInfiniteBrowseSection
        loading={false}
        orderLoading={false}
        items={[{ id: 1, name: "Model A" }]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        sortableIds={[1]}
        sortEnabled
        onDragEnd={vi.fn()}
        hasMore
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("load-more-skeletons")).not.toBeInTheDocument();
  });
});
