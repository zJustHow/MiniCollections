import { render } from "@testing-library/react";
import NeuCardGridSkeleton from "./NeuCardGridSkeleton";

vi.mock("./NeuCardSkeleton", () => ({
  default: () => <div data-testid="card-skeleton" />,
}));

vi.mock("../utils/apiClient", () => ({
  SKELETON_CARD_COUNT: 2,
}));

describe("NeuCardGridSkeleton", () => {
  test("search section grid skips aria-busy wrapper so cards participate in parent grid", () => {
    const { container } = render(
      <NeuCardGridSkeleton variant="object" className="neu-search-section-grid" />,
    );

    expect(container.querySelector(".neu-search-section-grid")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(container.querySelectorAll("[data-testid='card-skeleton']")).toHaveLength(
      2,
    );
    expect(container.childElementCount).toBe(1);
  });

  test("reserveSearchRow renders toolbar placeholder", () => {
    const { container } = render(<NeuCardGridSkeleton reserveSearchRow />);

    expect(
      container.querySelector(".neu-list-page-layout--with-toolbar"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".neu-list-page-search-field-skeleton"),
    ).toBeInTheDocument();
    expect(container.querySelector(".neu-list-page-summary")).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-testid='card-skeleton']")).toHaveLength(
      2,
    );
  });
});
