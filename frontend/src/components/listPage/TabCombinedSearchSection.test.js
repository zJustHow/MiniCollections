import { render, screen } from "@testing-library/react";
import TabCombinedSearchSection from "./TabCombinedSearchSection";

vi.mock("../NeuCardGridSkeleton", () => ({
  default: ({ className }) => (
    <div data-testid="search-skeleton" className={className} />
  ),
}));

vi.mock("../ObjectSearchFilterLayout", () => ({
  default: ({ children }) => <div data-testid="filter-layout">{children}</div>,
}));

describe("TabCombinedSearchSection", () => {
  test("shows skeleton while spinning", () => {
    const { container } = render(
      <TabCombinedSearchSection
        spinning
        hasResults={false}
        showPrimaryCards={false}
        showObjectSection={false}
        showObjectCards={false}
        showDivider={false}
        primaryCards={null}
        objectCards={null}
      />,
    );

    expect(screen.getByTestId("search-skeleton")).toBeInTheDocument();
    expect(
      container.querySelector(".neu-search-objects-cards"),
    ).toBeInTheDocument();
  });

  test("returns null when there are no results", () => {
    const { container } = render(
      <TabCombinedSearchSection
        spinning={false}
        hasResults={false}
        showPrimaryCards={false}
        showObjectSection={false}
        showObjectCards={false}
        showDivider={false}
        primaryCards={null}
        objectCards={null}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("renders primary and object sections with divider", () => {
    render(
      <TabCombinedSearchSection
        spinning={false}
        hasResults
        showPrimaryCards
        showObjectSection
        showObjectCards
        showDivider
        primaryCards={<div>primary-hit</div>}
        objectCards={<div>object-hit</div>}
      />,
    );

    expect(screen.getByText("primary-hit")).toBeInTheDocument();
    expect(screen.getByText("object-hit")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  test("wraps spinning state in filter layout when requested", () => {
    render(
      <TabCombinedSearchSection
        spinning
        withFilterLayout
        filterLayoutProps={{ title: "Filters" }}
        hasResults={false}
        showPrimaryCards={false}
        showObjectSection={false}
        showObjectCards={false}
        showDivider={false}
        primaryCards={null}
        objectCards={null}
      />,
    );

    expect(screen.getByTestId("filter-layout")).toBeInTheDocument();
    expect(screen.getByTestId("search-skeleton")).toBeInTheDocument();
  });
});
