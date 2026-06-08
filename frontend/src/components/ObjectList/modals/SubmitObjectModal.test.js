import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubmitObjectModal from "./SubmitObjectModal";

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
  };
});

vi.mock("../../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../../utils", () => ({
  submitFeedback: vi.fn(),
  getCategories: vi.fn(async () => []),
  getScales: vi.fn(async () => []),
  getSeriesByBrandId: vi.fn(async () => []),
}));

vi.mock("../../NeuFormDrawer", () => ({
  default: ({ open, title, children, onOk, okText }) =>
    open ? (
      <div data-testid="submit-drawer">
        <div>{title}</div>
        {children}
        <button type="button" onClick={onOk}>
          {okText}
        </button>
      </div>
    ) : null,
}));

vi.mock("../../BrandSelectField", () => ({
  default: () => <div data-testid="brand-select" />,
  OTHER_BRAND: "__other__",
}));

vi.mock("../../ImageUploadField", () => ({
  default: () => <div data-testid="image-upload" />,
}));

describe("SubmitObjectModal", () => {
  test("renders missing model form by default", async () => {
    render(<SubmitObjectModal visible onCancel={vi.fn()} selectedBrand={null} />);

    await waitFor(() => {
      expect(screen.getByTestId("submit-drawer")).toBeInTheDocument();
      expect(screen.getByText("reportModalTitleMissingModel")).toBeInTheDocument();
      expect(screen.getByText("feedbackTypeMissingModel")).toBeInTheDocument();
      expect(screen.getByTestId("brand-select")).toBeInTheDocument();
    });
  });

  test("switches to bug report form", async () => {
    render(<SubmitObjectModal visible onCancel={vi.fn()} selectedBrand={null} />);

    await userEvent.click(screen.getByText("feedbackTypeBugReport"));

    await waitFor(() => {
      expect(screen.getByText("reportModalTitleBugReport")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText("bugSubjectPlaceholder")).toBeInTheDocument();
  });
});
