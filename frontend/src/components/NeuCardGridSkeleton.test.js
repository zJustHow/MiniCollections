import { render } from "@testing-library/react";
import NeuCardGridSkeleton from "./NeuCardGridSkeleton";

vi.mock("./NeuCardSkeleton", () => ({
  default: () => <div data-testid="card-skeleton" />,
}));

vi.mock("../utils/apiClient", () => ({
  PAGE_SIZE: 2,
}));

describe("NeuCardGridSkeleton", () => {
  test("reserveSearchRow renders toolbar placeholder", () => {
    const { container } = render(<NeuCardGridSkeleton reserveSearchRow />);

    expect(
      container.querySelector(".neu-list-page-layout--with-toolbar"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".neu-list-page-search-field-skeleton"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".neu-list-page-summary"),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("[data-testid='card-skeleton']")).toHaveLength(
      2,
    );
  });
});
