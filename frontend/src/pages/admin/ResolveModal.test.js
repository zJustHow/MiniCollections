import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResolveModal from "./ResolveModal";

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
      <div data-testid="resolve-drawer">
        <div>{title}</div>
        {children}
        <button type="button" onClick={onOk}>
          {okText}
        </button>
      </div>
    ) : null,
}));

vi.mock("../../utils", () => ({
  approveSubmission: vi.fn(),
}));

import { approveSubmission } from "../../utils";

describe("ResolveModal", () => {
  beforeEach(() => {
    messageMock.success.mockReset();
    messageMock.error.mockReset();
  });

  test("submits admin note for bug report resolution", async () => {
    vi.mocked(approveSubmission).mockResolvedValue({});
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <ResolveModal
        open
        submission={{ id: 7, submission_type: "BUG_REPORT" }}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("resolveTitle")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox"), "Fixed in prod");
    await userEvent.click(screen.getByText("resolveSubmission"));

    await waitFor(() => {
      expect(approveSubmission).toHaveBeenCalledWith(7, {
        brand_id: null,
        name_en: null,
        name_zh: null,
        image_url: null,
        release_price_cny: null,
        release_price_usd: null,
        release_date: null,
        category_id: null,
        scale_id: null,
        admin_note: "Fixed in prod",
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  test("shows error when resolve submission fails", async () => {
    vi.mocked(approveSubmission).mockRejectedValue(new Error("network"));

    render(
      <ResolveModal
        open
        submission={{ id: 7, submission_type: "BUG_REPORT" }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByRole("textbox"), "Fixed in prod");
    await userEvent.click(screen.getByText("resolveSubmission"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("network");
    });
  });
});
