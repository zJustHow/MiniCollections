import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackPage from "./FeedbackPage";

const messageMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const localeMocks = vi.hoisted(() => ({
  t: (key) => key,
}));

const pagedListMocks = vi.hoisted(() => ({
  items: [
    {
      id: 1,
      submission_type: "BUG_REPORT",
      status: "PENDING",
      notes: "Something broke",
      submitted_at: "2024-06-01T10:00:00Z",
    },
  ],
  page: 2,
  totalPages: 5,
  loading: false,
  loadPage: vi.fn(),
  onPageChange: vi.fn(),
}));

const deleteMySubmissionMock = vi.hoisted(() => vi.fn());

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: messageMock }),
    }),
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: localeMocks.t }),
}));

vi.mock("../hooks/usePagedList", () => ({
  default: () => pagedListMocks,
}));

vi.mock("../utils/submissionsApi", () => ({
  deleteMySubmission: deleteMySubmissionMock,
  getMySubmissionsPage: vi.fn(),
}));

vi.mock("../utils/lazyModal", () => ({
  createLazyModal: () => () => null,
}));

vi.mock("../components/FeedbackPageSkeleton", () => ({
  FeedbackListSkeleton: () => <div data-testid="feedback-skeleton" />,
}));

vi.mock("../components/ListPagination", () => ({
  default: () => <div data-testid="pagination" />,
}));

vi.mock("../components/NeuCard", () => ({
  default: ({ children, onClick }) => (
    <div role="button" tabIndex={0} onClick={onClick}>
      {children}
    </div>
  ),
}));

vi.mock("../components/NeuFormDrawer", () => ({
  default: ({ open, title, onClose, onDelete }) =>
    open ? (
      <div data-testid="feedback-drawer">
        <div>{title}</div>
        <button type="button" onClick={onClose}>
          close
        </button>
        <button type="button" onClick={onDelete}>
          delete
        </button>
      </div>
    ) : null,
}));

vi.mock("../components/DetailImage", () => ({
  default: () => null,
}));

describe("FeedbackPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    messageMock.success.mockReset();
    messageMock.error.mockReset();
    pagedListMocks.items = [
      {
        id: 1,
        submission_type: "BUG_REPORT",
        status: "PENDING",
        notes: "Something broke",
        submitted_at: "2024-06-01T10:00:00Z",
      },
    ];
    pagedListMocks.loading = false;
    pagedListMocks.page = 2;
    pagedListMocks.loadPage.mockReset();
    pagedListMocks.onPageChange.mockReset();
    deleteMySubmissionMock.mockReset();
    deleteMySubmissionMock.mockResolvedValue(undefined);
  });

  test("renders submission list and new feedback button", () => {
    render(<FeedbackPage />);

    expect(screen.getByRole("button", { name: /newFeedback/i })).toBeInTheDocument();
    expect(screen.getByText("feedbackTypeBugReport")).toBeInTheDocument();
    expect(screen.getAllByText("Something broke").length).toBeGreaterThan(0);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  test("shows skeleton while initial list is loading", () => {
    pagedListMocks.loading = true;
    pagedListMocks.items = [];

    render(<FeedbackPage />);

    expect(screen.getByTestId("feedback-skeleton")).toBeInTheDocument();
  });

  test("shows empty state when user has no submissions", async () => {
    pagedListMocks.items = [];

    render(<FeedbackPage />);

    await waitFor(() => {
      expect(screen.getByText("myFeedbackEmpty")).toBeInTheDocument();
    });
  });

  test("opens detail drawer when submission card is clicked", async () => {
    render(<FeedbackPage />);

    await userEvent.click(screen.getAllByText("Something broke")[0]);

    expect(screen.getByTestId("feedback-drawer")).toBeInTheDocument();
  });

  test("reloads submissions when refresh is clicked", async () => {
    render(<FeedbackPage />);

    const buttons = screen.getAllByRole("button");
    const refreshButton = buttons.find((button) => button.querySelector(".anticon-reload"));
    expect(refreshButton).toBeTruthy();

    await userEvent.click(refreshButton);

    expect(pagedListMocks.loadPage).toHaveBeenCalledWith(2);
  });

  test("deletes submission from detail drawer", async () => {
    render(<FeedbackPage />);

    await userEvent.click(screen.getAllByText("Something broke")[0]);
    await userEvent.click(screen.getByText("delete"));

    await waitFor(() => {
      expect(deleteMySubmissionMock).toHaveBeenCalledWith(1);
      expect(messageMock.success).toHaveBeenCalledWith("feedbackDeleted");
      expect(pagedListMocks.loadPage).toHaveBeenCalledWith(2);
    });
    expect(screen.queryByTestId("feedback-drawer")).not.toBeInTheDocument();
  });

  test("shows error when delete fails", async () => {
    deleteMySubmissionMock.mockRejectedValue(new Error("forbidden"));

    render(<FeedbackPage />);

    await userEvent.click(screen.getAllByText("Something broke")[0]);
    await userEvent.click(screen.getByText("delete"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("forbidden");
    });
    expect(screen.getByTestId("feedback-drawer")).toBeInTheDocument();
  });

  test("closes detail drawer without deleting", async () => {
    render(<FeedbackPage />);

    await userEvent.click(screen.getAllByText("Something broke")[0]);
    expect(screen.getByTestId("feedback-drawer")).toBeInTheDocument();

    await userEvent.click(screen.getByText("close"));

    expect(screen.queryByTestId("feedback-drawer")).not.toBeInTheDocument();
    expect(deleteMySubmissionMock).not.toHaveBeenCalled();
  });

  test("renders submission type labels for all feedback types", () => {
    pagedListMocks.items = [
      {
        id: 2,
        submission_type: "MISSING_MODEL",
        status: "APPROVED",
        name_en: "Missing GT",
        submitted_at: "2024-06-02T10:00:00Z",
      },
      {
        id: 3,
        submission_type: "DATA_CORRECTION",
        status: "RESOLVED",
        notes: "Fix scale",
        submitted_at: "2024-06-03T10:00:00Z",
      },
    ];

    render(<FeedbackPage />);

    expect(screen.getByText("feedbackTypeMissingModel")).toBeInTheDocument();
    expect(screen.getByText("feedbackTypeDataCorrection")).toBeInTheDocument();
    expect(screen.getByText("statusApproved")).toBeInTheDocument();
    expect(screen.getByText("statusResolved")).toBeInTheDocument();
  });
});
