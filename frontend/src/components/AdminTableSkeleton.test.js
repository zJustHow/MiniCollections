import { render } from "@testing-library/react";
import AdminTableSkeleton from "./AdminTableSkeleton";

describe("AdminTableSkeleton", () => {
  test("renders default skeleton grid", () => {
    render(<AdminTableSkeleton />);

    expect(document.querySelector(".neu-table-skeleton")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelectorAll(".neu-table-skeleton-row")).toHaveLength(10);
    expect(document.querySelectorAll(".neu-table-skeleton-cell--header")).toHaveLength(6);
  });

  test("uses admin submissions column template for seven columns", () => {
    render(<AdminTableSkeleton columns={7} rows={3} />);

    const header = document.querySelector(".neu-table-skeleton-header");
    expect(header).toHaveStyle({ gridTemplateColumns: "60px 120px 140px 100px 1fr 110px 160px" });
    expect(document.querySelectorAll(".neu-table-skeleton-row")).toHaveLength(3);
    expect(document.querySelectorAll(".neu-table-skeleton-cell--header")).toHaveLength(7);
  });

  test("wraps grid in neu-panel to match loaded admin tables", () => {
    render(<AdminTableSkeleton columns={3} />);

    const panel = document.querySelector(".neu-panel");
    expect(panel).toBeInTheDocument();
    expect(panel.querySelector(".neu-table-skeleton")).toHaveAttribute("aria-busy", "true");
  });

  test("uses category column template for six columns", () => {
    render(<AdminTableSkeleton columns={6} rows={2} />);

    const header = document.querySelector(".neu-table-skeleton-header");
    expect(header).toHaveStyle({
      gridTemplateColumns: "60px 1fr 1fr 1fr 100px 80px",
    });
  });
});
