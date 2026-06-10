import { render, screen } from "@testing-library/react";
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

  test("register variant loads auth skeleton", () => {
    render(<PageLoader variant="register" />);
    expect(screen.getByTestId("auth-skeleton-register")).toBeInTheDocument();
    expect(screen.queryByTestId("splash-loader")).not.toBeInTheDocument();
  });

  test("brandObjects variant loads object card grid skeleton", () => {
    render(<PageLoader variant="brandObjects" />);
    expect(screen.getByTestId("card-grid-object")).toBeInTheDocument();
    expect(screen.queryByTestId("splash-loader")).not.toBeInTheDocument();
  });

  test("groupObjectDetail variant loads related object skeleton", () => {
    render(<PageLoader variant="groupObjectDetail" />);
    expect(screen.getByTestId("object-detail-related")).toBeInTheDocument();
    expect(screen.queryByTestId("splash-loader")).not.toBeInTheDocument();
  });
});
