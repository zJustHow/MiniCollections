import { render, screen } from "@testing-library/react";
import InfiniteScrollSentinel from "./InfiniteScrollSentinel";

describe("InfiniteScrollSentinel", () => {
  beforeEach(() => {
    global.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }));
  });

  test("returns null when disabled", () => {
    const { container } = render(
      <InfiniteScrollSentinel enabled={false} loading={false} onLoadMore={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders sentinel when enabled", () => {
    render(
      <InfiniteScrollSentinel enabled loading={false} onLoadMore={vi.fn()} />,
    );

    expect(screen.getByTestId("infinite-scroll-sentinel")).toBeInTheDocument();
  });

  test("calls onLoadMore when sentinel intersects", () => {
    let observerCallback;
    global.IntersectionObserver = vi.fn((callback) => {
      observerCallback = callback;
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      };
    });

    const onLoadMore = vi.fn();
    render(
      <InfiniteScrollSentinel enabled loading={false} onLoadMore={onLoadMore} />,
    );

    observerCallback([{ isIntersecting: true }]);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test("skips observer while loading", () => {
    render(
      <InfiniteScrollSentinel enabled loading onLoadMore={vi.fn()} />,
    );

    expect(global.IntersectionObserver).not.toHaveBeenCalled();
  });
});
