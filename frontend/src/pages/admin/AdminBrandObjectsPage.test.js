import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminBrandObjectsPage from "./AdminBrandObjectsPage";

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

vi.mock("./AdminBrandAddDrawer", () => ({
  default: () => null,
}));

vi.mock("../../hooks/usePagedList", () => ({
  default: () => ({
    items: [{ id: 42, name_en: "BMW M3", name_zh: null, scale: "1:64" }],
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

const sampleBrand = { id: 9, name: "BMW", name_en: "BMW" };

describe("AdminBrandObjectsPage", () => {
  test("renders brand object table rows", () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/admin/brands/9", state: { brand: sampleBrand } },
        ]}
      >
        <Routes>
          <Route
            path="/admin/brands/:brandId"
            element={<AdminBrandObjectsPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("BMW M3")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
