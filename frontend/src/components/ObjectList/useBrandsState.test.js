import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import useBrandsState from "./useBrandsState";

const mockNavigate = vi.fn();
const mockSetHeaderSlot = vi.fn();
const mockClearSearchAndFilters = vi.fn();
const mockSetSearchQueryClearingFilters = vi.fn();
const mockClearObjectFilters = vi.fn();
const mockBrandsBrowseRefresh = vi.fn();
const mockCombinedLoadPage = vi.fn();

let mockSearchValue = "";
let mockPathname = "/";

const mockBrandsBrowse = {
  items: [{ id: 1, name_en: "Kyosho" }],
  loading: false,
  refresh: mockBrandsBrowseRefresh,
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

vi.mock("../../hooks/useInfiniteList", () => ({
  default: () => mockBrandsBrowse,
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

  test("handleBrandClick navigates with return search state", async () => {
    mockSearchValue = "bmw";
    const { result } = renderHook(() => useBrandsState(), { wrapper });

    await act(async () => {
      result.current.handleBrandClick({ id: 9, name_en: "Mini GT" });
    });

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
    expect(mockBrandsBrowseRefresh).not.toHaveBeenCalled();
  });

  test("refreshBrands reloads browse list when search is inactive", () => {
    const { result } = renderHook(() => useBrandsState(), { wrapper });

    act(() => {
      result.current.refreshBrands();
    });

    expect(mockBrandsBrowseRefresh).toHaveBeenCalled();
    expect(mockCombinedLoadPage).not.toHaveBeenCalled();
  });

  test("clears filters when q param changes", async () => {
    mockSearchValue = "bmw";
    const { rerender } = renderHook(() => useBrandsState(), { wrapper });

    await waitFor(() => expect(mockClearObjectFilters).not.toHaveBeenCalled());

    mockSearchValue = "mini gt";
    rerender();

    await waitFor(() => expect(mockClearObjectFilters).toHaveBeenCalled());
  });
});
