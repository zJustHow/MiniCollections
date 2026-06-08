import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./AdminLayout";

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
  };
});

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../utils/submissionsApi", () => ({
  getAdminSubmissionCounts: vi.fn(),
}));

vi.mock("../../components/AdminSidebarSkeleton", () => ({
  default: () => <div data-testid="sidebar-skeleton" />,
}));

vi.mock("../../components/AdminTableSkeleton", () => ({
  default: () => <div data-testid="table-skeleton" />,
}));

import { getAdminSubmissionCounts } from "../../utils/submissionsApi";

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.mocked(getAdminSubmissionCounts).mockResolvedValue({
      pending: 2,
      approved: 5,
      rejected: 1,
      total: 8,
    });
  });

  test("renders submission status sidebar and outlet", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div data-testid="admin-outlet" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("submissionsPending")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByTestId("admin-outlet")).toBeInTheDocument();
    });
  });

  test("navigates to brands section", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div data-testid="admin-outlet" />} />
            <Route path="brands" element={<div data-testid="brands-outlet" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("brands")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("brands"));

    await waitFor(() => {
      expect(screen.getByTestId("brands-outlet")).toBeInTheDocument();
    });
  });
});
