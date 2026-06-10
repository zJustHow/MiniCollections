import { render, screen } from "@testing-library/react";
import InfiniteScrollSkeletonCards, {
  buildLoadMoreSkeletonIds,
  isLoadMoreSkeletonId,
} from "./InfiniteScrollSkeletonCards";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: ({ id }) => ({
    setNodeRef: vi.fn(),
    id,
  }),
}));

vi.mock("../NeuCardSkeleton", () => ({
  default: ({ variant }) => (
    <div data-testid="load-more-skeleton" data-variant={variant} />
  ),
}));

describe("InfiniteScrollSkeletonCards", () => {
  test("renders catalog skeleton count", () => {
    render(<InfiniteScrollSkeletonCards variant="catalog" />);
    expect(screen.getAllByTestId("load-more-skeleton")).toHaveLength(4);
  });

  test("renders object skeleton count", () => {
    render(<InfiniteScrollSkeletonCards variant="object" />);
    expect(screen.getAllByTestId("load-more-skeleton")).toHaveLength(6);
  });

  test("wraps skeletons as sortable drop targets when sorting is enabled", () => {
    const { container } = render(
      <InfiniteScrollSkeletonCards variant="catalog" sortEnabled />,
    );

    expect(screen.getAllByTestId("load-more-skeleton")).toHaveLength(4);
    expect(container.querySelectorAll(".neu-sortable-skeleton-wrap")).toHaveLength(4);
  });

  test("buildLoadMoreSkeletonIds only returns ids while loading more with sorting", () => {
    expect(
      buildLoadMoreSkeletonIds({
        variant: "catalog",
        sortEnabled: true,
        loadingMore: true,
      }),
    ).toEqual([
      "__load-more-skeleton-0",
      "__load-more-skeleton-1",
      "__load-more-skeleton-2",
      "__load-more-skeleton-3",
    ]);
    expect(
      buildLoadMoreSkeletonIds({
        variant: "catalog",
        sortEnabled: false,
        loadingMore: true,
      }),
    ).toEqual([]);
    expect(isLoadMoreSkeletonId("__load-more-skeleton-2")).toBe(true);
    expect(isLoadMoreSkeletonId(42)).toBe(false);
  });
});
