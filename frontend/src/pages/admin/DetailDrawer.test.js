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

  test("renders missing model approve action for pending submission", () => {
    render(
      <DetailDrawer
        submission={{
          id: 8,
          status: "PENDING",
          submission_type: "MISSING_MODEL",
          submitter_name: "Bob",
          brand_name: "BMW",
          name_en: "M2",
        }}
        onClose={vi.fn()}
        onApprove={vi.fn()}
        onResolve={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(screen.getByText("BMW")).toBeInTheDocument();
    expect(screen.getByText("M2")).toBeInTheDocument();
    expect(screen.getByLabelText("approveSubmission")).toBeInTheDocument();
  });

  test("hides actions for reviewed submission", () => {
    render(
      <DetailDrawer
        submission={{
          id: 9,
          status: "APPROVED",
          submission_type: "BUG_REPORT",
          submitter_name: "Alice",
          name_en: "Fixed issue",
          notes: "Done",
        }}
        onClose={vi.fn()}
        onApprove={vi.fn()}
        onResolve={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("resolveSubmission")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("approveSubmission")).not.toBeInTheDocument();
  });

  test("renders data correction details with brand name", () => {
    render(
      <DetailDrawer
        submission={{
          id: 10,
          status: "PENDING",
          submission_type: "DATA_CORRECTION",
          submitter_name: "Carol",
          brand_name: "Mini GT",
          name_en: "Wrong scale label",
          notes: "Scale should be 1:64",
        }}
        onClose={vi.fn()}
        onApprove={vi.fn()}
        onResolve={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(screen.getByText("Mini GT")).toBeInTheDocument();
    expect(screen.getByText("Wrong scale label")).toBeInTheDocument();
    expect(screen.getByLabelText("resolveSubmission")).toBeInTheDocument();
  });
});
