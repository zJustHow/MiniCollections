import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApproveModal from "./ApproveModal";

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
      <div data-testid="approve-drawer">
        <div>{title}</div>
        {children}
        <button type="button" onClick={onOk}>
          {okText}
        </button>
      </div>
    ) : null,
}));

vi.mock("../../components/BrandSelectField", () => ({
  default: () => <div data-testid="brand-select" />,
}));

vi.mock("../../components/NeuFormControl", () => ({
  NeuInput: (props) => <input {...props} />,
  NeuSelect: () => <div data-testid="neu-select" />,
  NeuInputNumber: () => <input />,
  NeuDatePicker: () => <div data-testid="date-picker" />,
}));

vi.mock("../../utils", () => ({
  approveSubmission: vi.fn(),
  getCategories: vi.fn(async () => []),
  getScales: vi.fn(async () => []),
  getSeriesByBrandId: vi.fn(async () => []),
}));

import { approveSubmission } from "../../utils";

describe("ApproveModal", () => {
  beforeEach(() => {
    messageMock.success.mockReset();
    messageMock.error.mockReset();
  });

  test("renders approval form with prefilled submission fields", async () => {
    render(
      <ApproveModal
        open
        submission={{
          id: 4,
          brand_id: 9,
          name_en: "M2",
          name_zh: "宝马M2",
        }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("approve-drawer")).toBeInTheDocument();
      expect(screen.getByText("approveTitle")).toBeInTheDocument();
      expect(screen.getByText("brand")).toBeInTheDocument();
      expect(screen.getByTestId("brand-select")).toBeInTheDocument();
    });
  });

  test("submits approval with prefilled submission values", async () => {
    vi.mocked(approveSubmission).mockResolvedValue({});
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <ApproveModal
        open
        submission={{
          id: 4,
          brand_id: 9,
          name_en: "M2",
          name_zh: "宝马M2",
        }}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("M2")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("approveSubmission"));

    await waitFor(() => {
      expect(approveSubmission).toHaveBeenCalledWith(4, {
        brand_id: 9,
        name_en: "M2",
        name_zh: "宝马M2",
        image_url: null,
        release_price_cny: null,
        release_price_usd: null,
        release_date: null,
        series_id: null,
        category_id: null,
        scale_id: null,
        admin_note: null,
      });
      expect(messageMock.success).toHaveBeenCalledWith("submissionApproved");
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  test("shows error when approval submission fails", async () => {
    vi.mocked(approveSubmission).mockRejectedValue(new Error("network"));

    render(
      <ApproveModal
        open
        submission={{
          id: 4,
          brand_id: 9,
          name_en: "M2",
          name_zh: "宝马M2",
        }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("M2")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("approveSubmission"));

    await waitFor(() => {
      expect(messageMock.error).toHaveBeenCalledWith("network");
    });
  });
});
