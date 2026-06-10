import { render } from "@testing-library/react";
import StatsPanelSkeleton from "./StatsPanelSkeleton";
import StatsPageSkeleton from "./StatsPageSkeleton";

describe("StatsPanelSkeleton", () => {
  test("pie variant renders donut placeholder", () => {
    const { container } = render(<StatsPanelSkeleton variant="pie" />);
    expect(container.querySelector(".stats-panel-skeleton-pie")).toBeInTheDocument();
  });

  test("column variant renders bar placeholders", () => {
    const { container } = render(<StatsPanelSkeleton variant="column" />);
    expect(
      container.querySelectorAll(".stats-panel-skeleton-column-bar"),
    ).toHaveLength(8);
  });

  test("line variant renders wide chart placeholder", () => {
    const { container } = render(<StatsPanelSkeleton variant="line" wide />);
    expect(
      container.querySelector(".stats-panel-skeleton-line-chart"),
    ).toBeInTheDocument();
    expect(container.querySelector(".stats-card--wide")).toBeInTheDocument();
  });
});

describe("StatsPageSkeleton", () => {
  test("renders three panel skeletons", () => {
    const { container } = render(<StatsPageSkeleton />);
    expect(container.querySelectorAll(".stats-panel-skeleton")).toHaveLength(3);
  });
});
