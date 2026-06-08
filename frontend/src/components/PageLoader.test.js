import { render, screen, waitFor } from "@testing-library/react";
import PageLoader from "./PageLoader";

vi.mock("./SplashLoader", () => ({
  default: () => <div data-testid="splash-loader" />,
}));

vi.mock("./AuthPageSkeleton", () => ({
  default: ({ variant }) => <div data-testid={`auth-skeleton-${variant}`} />,
}));

vi.mock("./FeedbackPageSkeleton", () => ({
  default: () => <div data-testid="feedback-skeleton" />,
}));

vi.mock("./ProfilePageSkeleton", () => ({
  default: () => <div data-testid="profile-skeleton" />,
}));

vi.mock("./AdminLayoutSkeleton", () => ({
  default: () => <div data-testid="admin-layout-skeleton" />,
}));

vi.mock("./AdminTableSkeleton", () => ({
  default: () => <div data-testid="admin-table-skeleton" />,
}));

vi.mock("./NeuCardGridSkeleton", () => ({
  default: ({ variant }) => <div data-testid={`card-grid-${variant || "default"}`} />,
}));

vi.mock("./ObjectDetailPageSkeleton", () => ({
  default: ({ showRelatedModel }) => (
    <div data-testid={showRelatedModel ? "object-detail-related" : "object-detail"} />
  ),
}));

describe("PageLoader", () => {
  test("default variant shows splash loader", () => {
    render(<PageLoader />);
    expect(screen.getByTestId("splash-loader")).toBeInTheDocument();
  });

  test("register variant loads auth skeleton", async () => {
    render(<PageLoader variant="register" />);
    await waitFor(() => {
      expect(screen.getByTestId("auth-skeleton-register")).toBeInTheDocument();
    });
  });

  test("brandObjects variant loads object card grid skeleton", async () => {
    render(<PageLoader variant="brandObjects" />);
    await waitFor(() => {
      expect(screen.getByTestId("card-grid-object")).toBeInTheDocument();
    });
  });

  test("groupObjectDetail variant loads related object skeleton", async () => {
    render(<PageLoader variant="groupObjectDetail" />);
    await waitFor(() => {
      expect(screen.getByTestId("object-detail-related")).toBeInTheDocument();
    });
  });
});
