import { render, screen, waitFor } from "@testing-library/react";
import AdminCategoriesPage from "./AdminCategoriesPage";

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
  getCategories: vi.fn(async () => [
    {
      id: 1,
      slug: "cars",
      name_en: "Cars",
      name_zh: "汽车",
      sort_order: 1,
    },
  ]),
}));

vi.mock("../../utils/adminApi", () => ({
  adminDeleteCategory: vi.fn(),
}));

describe("AdminCategoriesPage", () => {
  test("renders category table rows", async () => {
    render(<AdminCategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText("cars")).toBeInTheDocument();
      expect(screen.getByText("Cars")).toBeInTheDocument();
    });
  });
});
