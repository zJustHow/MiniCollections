import { render, screen } from "@testing-library/react";
import DetailDrawer from "./DetailDrawer";

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../components/NeuFormDrawer", () => ({
  default: ({ open, title, children, trailing }) =>
    open ? (
      <div data-testid="detail-drawer">
        <div>{title}</div>
        {trailing}
        {children}
      </div>
    ) : null,
}));

vi.mock("../../components/DetailImage", () => ({
  default: () => null,
}));

const pendingBugReport = {
  id: 5,
  status: "PENDING",
  submission_type: "BUG_REPORT",
  submitter_name: "Alice",
  name_en: "Broken link",
  notes: "The detail page fails to load.",
};

describe("DetailDrawer", () => {
  test("renders pending bug report details and actions", () => {
    render(
      <DetailDrawer
        submission={pendingBugReport}
        onClose={vi.fn()}
        onApprove={vi.fn()}
        onResolve={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(screen.getByTestId("detail-drawer")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Broken link")).toBeInTheDocument();
    expect(screen.getByLabelText("resolveSubmission")).toBeInTheDocument();
  });

  test("renders nothing when submission is absent", () => {
    const { container } = render(
      <DetailDrawer
        submission={null}
        onClose={vi.fn()}
        onApprove={vi.fn()}
        onResolve={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
