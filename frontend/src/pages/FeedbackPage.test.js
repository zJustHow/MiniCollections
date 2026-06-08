import { render, screen } from "@testing-library/react";
import FeedbackPage from "./FeedbackPage";

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

vi.mock("../hooks/usePagedList", () => ({
  default: () => ({
    items: [
      {
        id: 1,
        submission_type: "BUG_REPORT",
        status: "PENDING",
        notes: "Something broke",
        submitted_at: "2024-06-01T10:00:00Z",
      },
    ],
    page: 0,
    totalPages: 1,
    loading: false,
    loadPage: vi.fn(),
    onPageChange: vi.fn(),
  }),
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

vi.mock("../components/NeuFormDrawer", () => ({
  default: () => null,
}));

describe("FeedbackPage", () => {
  test("renders submission list and new feedback button", () => {
    render(<FeedbackPage />);

    expect(screen.getByRole("button", { name: /newFeedback/i })).toBeInTheDocument();
    expect(screen.getByText("feedbackTypeBugReport")).toBeInTheDocument();
    expect(screen.getAllByText("Something broke").length).toBeGreaterThan(0);
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
