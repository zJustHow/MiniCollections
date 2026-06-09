import { render } from "@testing-library/react";
import AdminSidebarSkeleton from "./AdminSidebarSkeleton";

describe("AdminSidebarSkeleton", () => {
  test("renders sidebar loading placeholders", () => {
    render(<AdminSidebarSkeleton />);

    const root = document.querySelector(".neu-admin-sidebar-skeleton");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(document.querySelectorAll(".neu-admin-sidebar-skeleton-nav-item")).toHaveLength(5);
    expect(document.querySelectorAll(".neu-admin-sidebar-skeleton-section-title")).toHaveLength(2);
    expect(document.querySelector(".neu-admin-sidebar-skeleton-divider")).toBeInTheDocument();
  });
});
