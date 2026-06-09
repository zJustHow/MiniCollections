import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RejectModal from "./RejectModal";

const messageMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: messageMock }),
    }),
  };
});

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../components/NeuFormDrawer", () => ({
  default: ({ open, title, children, onOk, okText }) =>
    open ? (
      <div data-testid="reject-drawer">
        <div>{title}</div>
        {children}
        <button type="button" onClick={onOk}>
          {okText}
        </button>
      </div>
    ) : null,
}));

vi.mock("../../utils", () => ({
  rejectSubmission: vi.fn(),
}));

import { rejectSubmission } from "../../utils";

const submission = {
  id: 3,
  submission_type: "MISSING_MODEL",
};

describe("RejectModal", () => {
  beforeEach(() => {
    messageMock.success.mockReset();
    messageMock.error.mockReset();
  });

  test("submits reject reason for missing model", async () => {
    vi.mocked(rejectSubmission).mockResolvedValue({});
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <RejectModal
        open
        submission={submission}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("rejectTitle")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox"), "duplicate");
    await userEvent.click(screen.getByText("rejectSubmission"));

    await waitFor(() => {
      expect(rejectSubmission).toHaveBeenCalledWith(3, "duplicate");
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  test("closes bug report submission", async () => {
    vi.mocked(rejectSubmission).mockResolvedValue({});
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <RejectModal
        open
        submission={{ id: 8, submission_type: "BUG_REPORT" }}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("closeTitle")).toBeInTheDocument();
    await userEvent.click(screen.getByText("closeSubmission"));

    await waitFor(() => {
      expect(rejectSubmission).toHaveBeenCalledWith(8, null);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  test("shows error when reject submission fails", async () => {
    vi.mocked(rejectSubmission).mockRejectedValue(new Error("network"));

    render(
      <RejectModal
        open
        submission={submission}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByText("rejectSubmission"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("network");
    });
  });
});
