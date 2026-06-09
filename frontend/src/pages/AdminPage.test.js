import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "./AdminPage";

const adminLayoutMocks = vi.hoisted(() => ({
  activeStatus: "PENDING",
}));

const messageMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const localeMocks = vi.hoisted(() => ({
  t: (key) => key,
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  const Table = ({ dataSource = [], columns = [], onRow, rowKey = "id" }) => (
    <table data-testid="admin-submissions-table">
      <tbody>
        {dataSource.map((record) => {
          const rowProps = onRow?.(record) ?? {};
          return (
            <tr key={record[rowKey]} data-testid={`submission-row-${record[rowKey]}`} {...rowProps}>
              {columns.map((column) => (
                <td key={column.dataIndex}>
                  {column.render
                    ? column.render(record[column.dataIndex], record)
                    : record[column.dataIndex]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
  return {
    ...actual,
    Table,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: messageMock }),
    }),
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: localeMocks.t }),
}));

vi.mock("./admin/AdminLayout", () => ({
  useAdminLayoutContext: () => ({
    activeStatus: adminLayoutMocks.activeStatus,
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
  default: ({ submission }) =>
    submission ? (
      <div data-testid="detail-drawer">{submission.submitter_name}</div>
    ) : null,
}));

vi.mock("../components/ListPagination", () => ({
  default: ({ page, totalPages, onPageChange }) =>
    totalPages > 1 ? (
      <button type="button" data-testid="next-page" onClick={() => onPageChange(page + 2)}>
        next
      </button>
    ) : (
      <div data-testid="pagination" />
    ),
}));

vi.mock("../components/AdminTableSkeleton", () => ({
  default: () => <div data-testid="admin-table-skeleton" />,
}));

import { getAdminSubmissionsPage } from "../utils/submissionsApi";

describe("AdminPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    adminLayoutMocks.activeStatus = "PENDING";
    messageMock.success.mockReset();
    messageMock.error.mockReset();
    vi.mocked(getAdminSubmissionsPage).mockReset();
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

  test("loads submissions for approved sidebar status", async () => {
    adminLayoutMocks.activeStatus = "APPROVED";
    vi.mocked(getAdminSubmissionsPage).mockResolvedValue({
      content: [
        {
          id: 2,
          submitter_name: "Bob",
          submission_type: "MISSING_MODEL",
          status: "APPROVED",
          submitted_at: "2024-06-02T10:00:00Z",
        },
      ],
      total_pages: 1,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    expect(getAdminSubmissionsPage).toHaveBeenCalledWith({
      status: "APPROVED",
      page: 0,
      size: 20,
    });
  });

  test("loads submissions for rejected sidebar status", async () => {
    adminLayoutMocks.activeStatus = "REJECTED";
    vi.mocked(getAdminSubmissionsPage).mockResolvedValue({
      content: [
        {
          id: 3,
          submitter_name: "Carol",
          submission_type: "DATA_CORRECTION",
          status: "REJECTED",
          submitted_at: "2024-06-03T10:00:00Z",
        },
      ],
      total_pages: 1,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Carol")).toBeInTheDocument();
    });

    expect(getAdminSubmissionsPage).toHaveBeenCalledWith({
      status: "REJECTED",
      page: 0,
      size: 20,
    });
  });

  test("shows error when submissions fail to load", async () => {
    vi.mocked(getAdminSubmissionsPage).mockRejectedValue(new Error("network"));

    render(<AdminPage />);

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("network");
    });
  });

  test("opens detail drawer when table row is clicked", async () => {
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Alice").closest("tr"));

    expect(await screen.findByTestId("detail-drawer")).toHaveTextContent("Alice");
  });

  test("loads next page when pagination changes", async () => {
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
      total_pages: 3,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId("next-page"));

    await waitFor(() => {
      expect(getAdminSubmissionsPage).toHaveBeenCalledWith({
        status: "PENDING",
        page: 1,
        size: 20,
      });
    });
  });
});
