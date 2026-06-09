import { render, screen, waitFor } from "@testing-library/react";
import AdminScalesPage from "./AdminScalesPage";

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
  };
});

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("../../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: vi.fn() }),
}));

vi.mock("../../utils/lazyModal", () => ({
  createLazyModal: () => () => null,
}));

vi.mock("../../utils/scroll", () => ({
  scrollAppToTop: vi.fn(),
}));

vi.mock("./AdminLayout", () => ({
  useAdminLayoutContext: () => ({ navigateAdmin: vi.fn() }),
}));

vi.mock("../../utils/brandsApi", () => ({
  getScales: vi.fn(async () => [
    { id: 64, code: "1:64", denominator: 64 },
    { id: 43, code: "1:43", denominator: 43 },
  ]),
}));

vi.mock("../../utils/adminApi", () => ({
  adminDeleteScale: vi.fn(),
}));

describe("AdminScalesPage", () => {
  test("renders scale table rows", async () => {
    render(<AdminScalesPage />);

    await waitFor(() => {
      expect(screen.getByText("1:64")).toBeInTheDocument();
      expect(screen.getByText("1:43")).toBeInTheDocument();
    });
  });
});
