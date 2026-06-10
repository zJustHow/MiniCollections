import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortableInfiniteBrowseSection from "./SortableInfiniteBrowseSection";

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
      {children}
    </div>
  ),
  KeyboardSensor: class {},
  PointerSensor: class {},
  closestCenter: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }) => <div data-testid="sortable-context">{children}</div>,
  rectSortingStrategy: {},
  sortableKeyboardCoordinates: vi.fn(),
}));

vi.mock("./ObjectBrowseSection", () => ({
  default: ({ children, loading }) =>
    loading ? <div data-testid="browse-loading" /> : <div data-testid="browse-grid">{children}</div>,
}));

vi.mock("./InfiniteScrollSentinel", () => ({
  default: ({ enabled, onLoadMore }) =>
    enabled ? (
      <button type="button" data-testid="load-more" onClick={onLoadMore}>
        load more
      </button>
    ) : null,
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
});
