import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrandsTab from "./BrandsTab";

const mockNavigate = vi.fn();
const mockOnBrandClick = vi.fn();
const mockOnCreateBrand = vi.fn();
const mockOnSearch = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../LocaleContext", () => ({
  useLocale: () => ({
    t: (key) => key,
    locale: "en-US",
  }),
}));

vi.mock("../../hooks/useTabListSearchField", () => ({
  default: () => ({
    draftQuery: "bmw",
    handleDraftChange: vi.fn(),
  }),
}));

vi.mock("../listPage/ObjectListPageShell", () => ({
  default: ({ children, draftQuery, searchPlaceholder }) => (
    <div data-testid="shell">
      <input aria-label={searchPlaceholder} defaultValue={draftQuery} readOnly />
      {children}
    </div>
  ),
}));

vi.mock("../listPage/SortableInfiniteBrowseSection", () => ({
  default: ({ items, renderItem, loading }) =>
    loading ? (
      <div data-testid="browse-loading" />
    ) : (
      <div data-testid="browse-body">
        {items.map((item) => renderItem(item))}
      </div>
    ),
}));

vi.mock("../listPage/TabCombinedSearchSection", () => ({
  default: ({ primaryCards, objectCards }) => (
    <div data-testid="combined">
      <div data-testid="brand-cards">{primaryCards}</div>
      <div data-testid="object-cards">{objectCards}</div>
    </div>
  ),
}));

vi.mock("../listPage/ActivePagePagination", () => ({
  default: () => <div data-testid="pagination" />,
}));

vi.mock("../listPage/NoSearchResults", () => ({
  default: () => <div data-testid="no-results" />,
}));

vi.mock("../listPage/ObjectSearchFilterPanelSlot", () => ({
  default: () => <div data-testid="filters" />,
}));

vi.mock("../NeuCard", () => ({
  default: ({ name, onClick, add }) => (
    <button type="button" onClick={onClick}>
      {add ? "add-card" : name}
    </button>
  ),
}));

const baseProps = {
  brands: [{ id: 1, name: "Kyosho", image_url: null }],
  onSearch: mockOnSearch,
  onBrandClick: mockOnBrandClick,
  isAdmin: false,
  onCreateBrand: mockOnCreateBrand,
  searchActive: false,
  searchResultBrands: [],
  searchResultObjects: [],
  searchValue: "",
  brandsBrowse: { loading: false, hasMore: false },
  combinedSearchPage: { loading: false, totalBrands: 0, totalObjects: 0 },
  searchFacets: null,
  facetsLoading: false,
  selectedCategoryIds: [],
  selectedBrandIds: [],
  selectedScaleIds: [],
  selectedSeriesIds: [],
  onToggleCategory: vi.fn(),
  onToggleBrand: vi.fn(),
  onToggleScale: vi.fn(),
  onToggleSeries: vi.fn(),
};

describe("BrandsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders browse brands and handles click", async () => {
    render(<BrandsTab {...baseProps} />);

    expect(screen.getByTestId("browse-body")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Kyosho" }));
    expect(mockOnBrandClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: "Kyosho" }),
    );
  });

  test("shows admin add card in browse mode", () => {
    render(<BrandsTab {...baseProps} isAdmin />);

    expect(screen.getByRole("button", { name: "add-card" })).toBeInTheDocument();
  });

  test("renders combined search results when active", () => {
    render(
      <BrandsTab
        {...baseProps}
        searchActive
        searchValue="bmw"
        searchResultBrands={[{ id: 2, name: "Mini GT", image_url: null }]}
        searchResultObjects={[
          { id: 3, name: "Model", brand_id: 2, image_url: null },
        ]}
        combinedSearchPage={{
          loading: false,
          totalBrands: 1,
          totalObjects: 1,
        }}
        searchFacets={{ categories: [{ id: 1 }], brands: [], scales: [], series: [] }}
      />,
    );

    expect(screen.getByTestId("combined")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mini GT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Model" })).toBeInTheDocument();
  });

  test("navigates to object detail from search results", async () => {
    render(
      <BrandsTab
        {...baseProps}
        searchActive
        searchValue="m3"
        searchResultObjects={[
          { id: 3, name: "M3", brand_id: 2, image_url: null },
        ]}
        combinedSearchPage={{
          loading: false,
          totalBrands: 0,
          totalObjects: 1,
        }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "M3" }));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/brands/2/objects/3",
      expect.objectContaining({
        state: expect.objectContaining({
          brandObject: expect.objectContaining({ id: 3, name: "M3" }),
        }),
      }),
    );
  });

  test("shows no-results state for empty search", () => {
    render(
      <BrandsTab
        {...baseProps}
        searchActive
        searchValue="missing"
        combinedSearchPage={{
          loading: false,
          totalBrands: 0,
          totalObjects: 0,
        }}
      />,
    );

    expect(screen.getByTestId("no-results")).toBeInTheDocument();
  });

  test("shows browse loading state", () => {
    render(
      <BrandsTab
        {...baseProps}
        brandsBrowse={{ loading: true, hasMore: false }}
      />,
    );

    expect(screen.getByTestId("browse-loading")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kyosho" })).not.toBeInTheDocument();
  });
});
