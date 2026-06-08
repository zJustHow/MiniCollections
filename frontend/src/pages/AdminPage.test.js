import { render, screen, waitFor } from "@testing-library/react";
import AdminPage from "./AdminPage";

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("./admin/AdminLayout", () => ({
  useAdminLayoutContext: () => ({
    activeStatus: "PENDING",
    refreshSubmissions: vi.fn(),
  }),
}));

vi.mock("../utils/submissionsApi", () => ({
  getAdminSubmissionsPage: vi.fn(),
}));

vi.mock("../utils/lazyModal", () => ({
  createLazyModal: () => () => null,
}));

vi.mock("./admin/DetailDrawer", () => ({
  default: () => null,
}));

vi.mock("../components/ListPagination", () => ({
  default: () => <div data-testid="pagination" />,
}));

vi.mock("../components/AdminTableSkeleton", () => ({
  default: () => <div data-testid="admin-table-skeleton" />,
}));

import { getAdminSubmissionsPage } from "../utils/submissionsApi";

describe("AdminPage", () => {
  beforeEach(() => {
    vi.mocked(getAdminSubmissionsPage).mockResolvedValue({
      content: [
        {
          id: 1,
          submitter_name: "Alice",
          submission_type: "BUG_REPORT",
          status: "PENDING",
          submitted_at: "2024-06-01T10:00:00Z",
        },
      ],
      total_pages: 1,
    });
  });

  test("renders admin submissions table", async () => {
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("feedbackTypeBugReport")).toBeInTheDocument();
    });

    expect(getAdminSubmissionsPage).toHaveBeenCalledWith({
      status: "PENDING",
      page: 0,
      size: 20,
    });
  });

  test("shows loading skeleton before submissions load", () => {
    vi.mocked(getAdminSubmissionsPage).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<AdminPage />);

    expect(screen.getByTestId("admin-table-skeleton")).toBeInTheDocument();
  });
});
