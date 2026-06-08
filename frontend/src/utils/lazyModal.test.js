import { render, screen } from "@testing-library/react";
import { createLazyModal } from "./lazyModal";

vi.mock("./lazyWithRetry", () => ({
  lazyWithRetry: () =>
    function MockModal({ open, visible, title }) {
      const isOpen = open ?? visible ?? false;
      if (!isOpen) return null;
      return <div data-testid="modal">{title}</div>;
    },
}));

describe("createLazyModal", () => {
  test("returns null when closed", () => {
    const LazyModal = createLazyModal(async () => ({ default: () => null }));
    const { container } = render(<LazyModal open={false} title="Hidden" />);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders lazy modal when open prop is true", () => {
    const LazyModal = createLazyModal(async () => ({ default: () => null }));
    render(<LazyModal open title="Feedback" />);
    expect(screen.getByTestId("modal")).toHaveTextContent("Feedback");
  });

  test("supports visible alias prop", () => {
    const LazyModal = createLazyModal(async () => ({ default: () => null }));
    render(<LazyModal visible title="Visible" />);
    expect(screen.getByTestId("modal")).toHaveTextContent("Visible");
  });
});
