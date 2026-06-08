import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useBrandsState from "./useBrandsState";

const mockNavigate = vi.fn();
const mockSetHeaderSlot = vi.fn();
const mockClearSearchAndFilters = vi.fn();
const mockSetSearchQueryClearingFilters = vi.fn();
const mockClearObjectFilters = vi.fn();
const mockBrandsListLoadPage = vi.fn();
const mockCombinedLoadPage = vi.fn();

let mockSearchValue = "";
let mockPathname = "/";

const mockBrandsList = {
  items: [{ id: 1, name_en: "Kyosho" }],
  loading: false,
  loadPage: mockBrandsListLoadPage,
};

const mockCombinedSearch = {
  brands: [{ id: 2 }],
  objects: [{ id: 3 }],
  loading: true,
  loadPage: mockCombinedLoadPage,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: mockPathname,
      search: mockSearchValue ? `?q=${encodeURIComponent(mockSearchValue)}` : "",
    }),
  };
});

vi.mock("../../HeaderContext", () => ({
  useHeader: () => ({ setHeaderSlot: mockSetHeaderSlot }),
}));

vi.mock("../../hooks/useSearchParam", () => ({
  default: () => [mockSearchValue, vi.fn()],
}));

vi.mock("../../hooks/useObjectFilterParams", () => ({
  default: () => ({
    selectedCategoryIds: [],
    selectedBrandIds: [],
    selectedScaleIds: [],
    selectedSeriesIds: [],
    clearObjectFilters: mockClearObjectFilters,
    clearSearchAndFilters: mockClearSearchAndFilters,
    setSearchQueryClearingFilters: mockSetSearchQueryClearingFilters,
    onToggleCategory: vi.fn(),
    onToggleBrand: vi.fn(),
    onToggleScale: vi.fn(),
    onToggleSeries: vi.fn(),
  }),
}));

vi.mock("../../hooks/usePagedList", () => ({
  default: () => mockBrandsList,
}));

vi.mock("../../hooks/useCombinedBrandSearch", () => ({
  default: () => mockCombinedSearch,
}));

vi.mock("../../hooks/useSearchObjectFacets", () => ({
  default: () => ({ searchFacets: null, facetsLoading: false }),
}));

vi.mock("../pageHeaders/BrandObjectsPageHeader", () => ({
  default: () => null,
}));

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

describe("useBrandsState", () => {
  beforeEach(() => {
    mockSearchValue = "";
    mockPathname = "/";
    vi.clearAllMocks();
  });

  test("activates search mode when q param is present", async () => {
    mockSearchValue = "mini gt";

    const { result } = renderHook(() => useBrandsState(), { wrapper });

    await waitFor(() => expect(result.current.searchActive).toBe(true));
    expect(result.current.searchValue).toBe("mini gt");
    expect(result.current.loadingBrands).toBe(true);
  });

  test("handleBrandSearch clears state for empty keyword", async () => {
    const { result } = renderHook(() => useBrandsState(), { wrapper });

    await act(async () => {
      await result.current.handleBrandSearch("   ");
    });

    expect(mockClearSearchAndFilters).toHaveBeenCalled();
  });

  test("handleBrandSearch sets keyword through filter helper", async () => {
    const { result } = renderHook(() => useBrandsState(), { wrapper });

    await act(async () => {
      await result.current.handleBrandSearch("bmw");
    });

    expect(mockSetSearchQueryClearingFilters).toHaveBeenCalledWith("bmw");
  });

  test("handleBrandClick navigates and sets header slot", async () => {
    mockSearchValue = "bmw";
    const { result } = renderHook(() => useBrandsState(), { wrapper });

    await act(async () => {
      result.current.handleBrandClick({ id: 9, name_en: "Mini GT" });
    });

    expect(mockSetHeaderSlot).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/brands/9" }),
      expect.objectContaining({ state: expect.objectContaining({ returnSearch: "?q=bmw" }) }),
    );
  });

  test("refreshBrands reloads combined search when active", async () => {
    mockSearchValue = "bmw";
    const { result } = renderHook(() => useBrandsState(), { wrapper });

    await waitFor(() => expect(result.current.searchActive).toBe(true));

    act(() => {
      result.current.refreshBrands();
    });

    expect(mockCombinedLoadPage).toHaveBeenCalledWith(0);
    expect(mockBrandsListLoadPage).not.toHaveBeenCalled();
  });
});
