import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BrandObjectsPage from "./BrandObjectsPage";

const pageMocks = vi.hoisted(() => ({
  searchActive: false,
  searchKeyword: "",
  draftQuery: "",
  displayObjects: [{ id: 1, name: "M3", image_url: null }],
  facetsLoading: false,
  searchFacets: null,
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    }),
  };
});

vi.mock("../LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en-US" }),
}));

vi.mock("../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: vi.fn() }),
}));

vi.mock("../utils/lazyModal", () => ({
  createLazyModal: () => () => null,
}));

vi.mock("../utils/scroll", () => ({
  scrollAppToTop: vi.fn(),
}));

vi.mock("../utils/brandsApi", () => ({
  getBrandByBrandId: vi.fn(),
  getBrandObjectsPage: vi.fn(),
  searchBrandObjectsByBrandIdPage: vi.fn(),
  searchBrandObjectsByBrandIdFacets: vi.fn(),
  recordBrandView: vi.fn(),
}));

vi.mock("../hooks/useSearchParam", () => ({
  default: () => [""],
}));

vi.mock("../hooks/useObjectFilterParams", () => ({
  default: () => ({
    selectedCategoryIds: [],
    selectedScaleIds: [],
    selectedSeriesIds: [],
    clearObjectFilters: vi.fn(),
    clearSearchAndFilters: vi.fn(),
    setSearchQueryClearingFilters: vi.fn(),
    onToggleCategory: vi.fn(),
    onToggleScale: vi.fn(),
    onToggleSeries: vi.fn(),
  }),
}));

vi.mock("../hooks/useReturnSearchRef", () => ({
  default: () => ({ current: "" }),
}));

vi.mock("../hooks/useObjectListPageSearch", () => ({
  default: () => ({
    searchActive: pageMocks.searchActive,
    searchKeyword: pageMocks.searchKeyword,
    draftQuery: pageMocks.draftQuery,
    runSearch: vi.fn(),
    handleDraftChange: vi.fn(),
  }),
}));

vi.mock("../hooks/useDualModePagedList", () => ({
  default: () => ({
    activePage: { page: 0, loading: false, loadPage: vi.fn() },
    displayObjects: pageMocks.displayObjects,
    objectsSearch: { loading: false },
  }),
}));

vi.mock("../hooks/useSearchObjectFacets", () => ({
  default: () => ({
    searchFacets: pageMocks.searchFacets,
    facetsLoading: pageMocks.facetsLoading,
  }),
}));

vi.mock("../components/pageHeaders/BrandObjectsPageHeader", () => ({
  default: ({ brand }) => <div data-testid="brand-header">{brand?.name}</div>,
}));

vi.mock("../components/listPage/ObjectListPageShell", () => ({
  default: ({ children, searchPlaceholder, showFilterColumn, filter }) => (
    <div data-testid="object-list-shell">
      <span>{searchPlaceholder}</span>
      {showFilterColumn ? filter : null}
      {children}
    </div>
  ),
}));

vi.mock("../components/listPage/ObjectBrowseSection", () => ({
  default: ({ children, loading }) =>
    loading ? <div data-testid="browse-loading" /> : <div>{children}</div>,
}));

vi.mock("../components/listPage/FilteredObjectSearchSection", () => ({
  default: ({ children, showContent }) =>
    showContent ? <div data-testid="search-section">{children}</div> : null,
}));

vi.mock("../components/listPage/NoSearchResults", () => ({
  default: () => <div data-testid="no-results" />,
}));

vi.mock("../components/listPage/ObjectSearchFilterPanelSlot", () => ({
  default: () => <div data-testid="filter-panel" />,
}));

vi.mock("../components/listPage/ActivePagePagination", () => ({
  default: () => <div data-testid="pagination" />,
}));

vi.mock("../components/NeuCard", () => ({
  default: ({ name, onClick }) => (
    <button type="button" onClick={onClick}>
      {name}
    </button>
  ),
}));

const sampleBrand = { id: 9, name: "BMW" };

function renderPage(props = {}) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/brands/9", state: { brand: sampleBrand } },
      ]}
    >
      <Routes>
        <Route path="/brands/:brandId" element={<BrandObjectsPage {...props} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BrandObjectsPage", () => {
  beforeEach(() => {
    pageMocks.searchActive = false;
    pageMocks.searchKeyword = "";
    pageMocks.draftQuery = "";
    pageMocks.displayObjects = [{ id: 1, name: "M3", image_url: null }];
    pageMocks.facetsLoading = false;
    pageMocks.searchFacets = null;
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => "1"),
      setItem: vi.fn(),
    });
  });

  test("renders browse models and feedback link", () => {
    renderPage();

    expect(screen.getByTestId("object-list-shell")).toBeInTheDocument();
    expect(screen.getByText("searchModels")).toBeInTheDocument();
    expect(screen.getByText("M3")).toBeInTheDocument();
    expect(screen.getByText("reportFeedback")).toBeInTheDocument();
  });

  test("shows admin add card when isAdmin", () => {
    renderPage({ isAdmin: true });

    expect(screen.getByText("addBrandObject")).toBeInTheDocument();
  });

  test("renders search results section when search is active", () => {
    pageMocks.searchActive = true;
    pageMocks.searchKeyword = "m3";
    pageMocks.draftQuery = "m3";
    pageMocks.displayObjects = [{ id: 2, name: "M3 Competition", image_url: null }];

    renderPage();

    expect(screen.getByTestId("search-section")).toBeInTheDocument();
    expect(screen.getByText("M3 Competition")).toBeInTheDocument();
  });

  test("shows filter panel when search facets are available", () => {
    pageMocks.searchActive = true;
    pageMocks.searchKeyword = "m3";
    pageMocks.draftQuery = "m3";
    pageMocks.searchFacets = {
      total: 2,
      categories: [{ id: 1, name: "Cars", count: 2 }],
      brands: [],
      scales: [],
      series: [],
    };
    pageMocks.displayObjects = [{ id: 2, name: "M3", image_url: null }];

    renderPage();

    expect(screen.getByTestId("filter-panel")).toBeInTheDocument();
  });

  test("shows empty search results when query has no matches", () => {
    pageMocks.searchActive = true;
    pageMocks.searchKeyword = "missing";
    pageMocks.draftQuery = "missing";
    pageMocks.displayObjects = [];
    pageMocks.searchFacets = null;
    pageMocks.facetsLoading = false;

    renderPage();

    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });
});
