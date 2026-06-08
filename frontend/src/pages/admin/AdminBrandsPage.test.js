import { render, screen } from "@testing-library/react";
import AdminBrandsPage from "./AdminBrandsPage";

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

vi.mock("../../hooks/usePagedList", () => ({
  default: () => ({
    items: [{ id: 1, name_en: "Kyosho", name_zh: "京商" }],
    page: 0,
    totalPages: 1,
    loading: false,
    loadPage: vi.fn(),
    onPageChange: vi.fn(),
  }),
}));

vi.mock("../../components/pageHeaders/AdminBrandPageHeader", () => ({
  default: ({ brandName }) => <div data-testid="admin-brand-header">{brandName}</div>,
}));

vi.mock("../../components/ListPagination", () => ({
  default: () => <div data-testid="pagination" />,
}));

describe("AdminBrandsPage", () => {
  test("renders brand table rows", () => {
    render(<AdminBrandsPage />);

    expect(screen.getByText("Kyosho")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
