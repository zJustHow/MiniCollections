import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrandModal from "./BrandModal";

const mockAdminCreateBrand = vi.fn();
const mockAdminUpdateBrand = vi.fn();
const mockUploadBrandLogo = vi.fn();
const mockMessageError = vi.fn();
const mockMessageSuccess = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnClose = vi.fn();

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({
        message: {
          success: mockMessageSuccess,
          error: mockMessageError,
        },
      }),
    }),
  };
});

vi.mock("../../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../../utils", () => ({
  adminCreateBrand: (...args) => mockAdminCreateBrand(...args),
  adminUpdateBrand: (...args) => mockAdminUpdateBrand(...args),
  uploadBrandLogo: (...args) => mockUploadBrandLogo(...args),
}));

vi.mock("../../NeuFormDrawer", () => ({
  default: ({ open, onOk, title, children, okText }) =>
    open ? (
      <div>
        <h1>{title}</h1>
        {children}
        <button type="button" onClick={onOk}>
          {okText}
        </button>
      </div>
    ) : null,
}));

vi.mock("../../NeuFormControl", () => ({
  NeuInput: (props) => <input {...props} />,
}));

vi.mock("../../BrandLogoUploadField", () => ({
  default: ({ onPendingFile }) => (
    <button
      type="button"
      onClick={() => onPendingFile(new File(["logo"], "logo.png", { type: "image/png" }))}
    >
      pick logo
    </button>
  ),
}));

describe("BrandModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminCreateBrand.mockResolvedValue({ id: 9, name_en: "BMW" });
    mockAdminUpdateBrand.mockResolvedValue({ id: 5, name_en: "Renamed" });
    mockUploadBrandLogo.mockResolvedValue({ image_url: "logo.png" });
  });

  test("creates brand on submit", async () => {
    render(
      <BrandModal open onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await userEvent.type(screen.getByLabelText("nameEn"), "BMW");
    await userEvent.click(screen.getByRole("button", { name: "addBrand" }));

    await waitFor(() => {
      expect(mockAdminCreateBrand).toHaveBeenCalledWith({
        name_en: "BMW",
        name_zh: null,
        abbreviation: null,
        image_url: null,
      });
    });
    expect(mockMessageSuccess).toHaveBeenCalledWith("brandCreated");
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("shows error when create fails", async () => {
    mockAdminCreateBrand.mockRejectedValue(new Error("create failed"));

    render(
      <BrandModal open onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await userEvent.type(screen.getByLabelText("nameEn"), "BMW");
    await userEvent.click(screen.getByRole("button", { name: "addBrand" }));

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith("create failed");
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("updates brand on submit", async () => {
    const brand = {
      id: 5,
      name_en: "Kyosho",
      name_zh: "京商",
      abbreviation: "KYO",
      image_url: "old.png",
    };

    render(
      <BrandModal
        open
        brand={brand}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.clear(screen.getByLabelText("nameEn"));
    await userEvent.type(screen.getByLabelText("nameEn"), "Renamed");
    await userEvent.click(screen.getByRole("button", { name: "edit" }));

    await waitFor(() => {
      expect(mockAdminUpdateBrand).toHaveBeenCalledWith(5, {
        name_en: "Renamed",
        name_zh: "京商",
        abbreviation: "KYO",
        image_url: "old.png",
      });
    });
    expect(mockMessageSuccess).toHaveBeenCalledWith("brandUpdated");
    expect(mockAdminCreateBrand).not.toHaveBeenCalled();
  });

  test("uploads logo after creating brand", async () => {
    render(
      <BrandModal open onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "pick logo" }));
    await userEvent.type(screen.getByLabelText("nameEn"), "BMW");
    await userEvent.click(screen.getByRole("button", { name: "addBrand" }));

    await waitFor(() => {
      expect(mockUploadBrandLogo).toHaveBeenCalledWith(9, expect.any(File));
    });
  });

  test("uses fallback error message when create fails without details", async () => {
    mockAdminCreateBrand.mockRejectedValue({});

    render(
      <BrandModal open onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );

    await userEvent.type(screen.getByLabelText("nameEn"), "BMW");
    await userEvent.click(screen.getByRole("button", { name: "addBrand" }));

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith("failedToCreateBrand");
    });
  });
});
