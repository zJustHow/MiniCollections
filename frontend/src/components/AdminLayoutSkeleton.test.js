import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminLayoutSkeleton from "./AdminLayoutSkeleton";

vi.mock("./AdminSidebarSkeleton", () => ({
  default: () => <div data-testid="admin-sidebar-skeleton" />,
}));

vi.mock("./AdminTableSkeleton", () => ({
  default: ({ columns }) => (
    <div data-testid="admin-table-skeleton" data-columns={columns} />
  ),
}));

describe("AdminLayoutSkeleton", () => {
  test("shows sidebar on submissions route", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminLayoutSkeleton />
      </MemoryRouter>,
    );

    expect(getByTestId("admin-sidebar-skeleton")).toBeInTheDocument();
    expect(getByTestId("admin-table-skeleton")).toHaveAttribute("data-columns", "7");
  });

  test("hides sidebar on catalog admin routes", () => {
    const { queryByTestId, getByTestId } = render(
      <MemoryRouter initialEntries={["/admin/brands"]}>
        <AdminLayoutSkeleton />
      </MemoryRouter>,
    );

    expect(queryByTestId("admin-sidebar-skeleton")).not.toBeInTheDocument();
    expect(getByTestId("admin-table-skeleton")).toHaveAttribute("data-columns", "3");
  });
});
