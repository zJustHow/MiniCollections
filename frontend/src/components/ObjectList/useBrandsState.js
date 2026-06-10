import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSearchParam from "../../hooks/useSearchParam";
import useObjectFilterParams from "../../hooks/useObjectFilterParams";
import useInfiniteList from "../../hooks/useInfiniteList";
import useCombinedBrandSearch from "../../hooks/useCombinedBrandSearch";
import useSearchObjectFacets from "../../hooks/useSearchObjectFacets";
import { PAGE_SIZE } from "../../utils/apiClient";
import {
  getBrandsPage,
  searchBrandsCombinedPage,
  searchBrandObjectsFacets,
} from "../../utils/brandsApi";
import { filterKeyFromIds } from "../../utils/filterParams";
import { prefetchBrandObjectsPage } from "../../utils/prefetchRoutes";

export default function useBrandsState({ isAdmin = false } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue] = useSearchParam();
  const {
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    selectedSeriesIds,
    clearObjectFilters,
    clearSearchAndFilters,
    setSearchQueryClearingFilters,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
    onToggleSeries,
  } = useObjectFilterParams();
  const [searchActive, setSearchActive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const syncedKeywordRef = useRef((searchValue ?? "").trim());

  const onBrandsTab = location.pathname === "/";

  const brandsBrowse = useInfiniteList(
    ({ size, page }) => getBrandsPage({ size, page }),
    {
      resetKey: "brands-list",
      enabled: onBrandsTab && !searchActive,
      pageSize: PAGE_SIZE,
      reservedFirstPageSlots: isAdmin ? 1 : 0,
    },
  );

  const objectFilterKey = filterKeyFromIds(
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    selectedSeriesIds,
  );

  const combinedSearch = useCombinedBrandSearch(
    ({ size, page }) =>
      searchBrandsCombinedPage(searchKeyword, {
        size,
        page,
        categoryIds: selectedCategoryIds,
        brandIds: selectedBrandIds,
        scaleIds: selectedScaleIds,
        seriesIds: selectedSeriesIds,
      }),
    {
      resetKey: `combined-search:${searchKeyword}:${objectFilterKey}`,
      enabled: onBrandsTab && searchActive && Boolean(searchKeyword),
      pageSize: PAGE_SIZE,
      pageParamKey: "searchPage",
    },
  );

  useEffect(() => {
    if (location.pathname !== "/") return;
    const keyword = (searchValue ?? "").trim();
    if (keyword) {
      if (keyword !== syncedKeywordRef.current) {
        clearObjectFilters();
        syncedKeywordRef.current = keyword;
      }
      setSearchKeyword(keyword);
      setSearchActive(true);
    } else {
      syncedKeywordRef.current = "";
      setSearchKeyword("");
      setSearchActive(false);
    }
  }, [location.pathname, searchValue, clearObjectFilters]);

  const { searchFacets, facetsLoading } = useSearchObjectFacets({
    enabled: onBrandsTab && searchActive && Boolean(searchKeyword),
    fetchFacets: () =>
      searchBrandObjectsFacets(searchKeyword, {
        categoryIds: selectedCategoryIds,
        brandIds: selectedBrandIds,
        scaleIds: selectedScaleIds,
        seriesIds: selectedSeriesIds,
      }),
    deps: [onBrandsTab, searchKeyword, searchActive, objectFilterKey],
  });

  const handleBrandClick = (brand) => {
    prefetchBrandObjectsPage();
    const returnSearch = location.search;
    const nextSearch = new URLSearchParams(location.search);
    nextSearch.delete("q");
    nextSearch.delete("categoryIds");
    nextSearch.delete("brandIds");
    nextSearch.delete("scaleIds");
    nextSearch.delete("seriesIds");
    nextSearch.delete("page");
    nextSearch.delete("searchPage");
    nextSearch.delete("brandPage");
    nextSearch.delete("objectPage");
    const search = nextSearch.toString();
    navigate(
      { pathname: `/brands/${brand.id}`, search: search ? `?${search}` : "" },
      { state: { brand, returnSearch } },
    );
  };

  const handleBrandSearch = useCallback(
    async (value) => {
      const keyword = value.trim();
      if (!keyword) {
        clearSearchAndFilters();
        setSearchKeyword("");
        setSearchActive(false);
        syncedKeywordRef.current = "";
        return;
      }
      setSearchQueryClearingFilters(keyword);
      syncedKeywordRef.current = keyword;
      setSearchKeyword(keyword);
      setSearchActive(true);
    },
    [clearSearchAndFilters, setSearchQueryClearingFilters],
  );

  const refreshBrands = useCallback(() => {
    if (searchActive) {
      combinedSearch.loadPage(0);
    } else {
      brandsBrowse.refresh();
    }
  }, [searchActive, brandsBrowse, combinedSearch]);

  const loadingBrands = searchActive ? combinedSearch.loading : brandsBrowse.loading;

  return useMemo(
    () => ({
      brands: brandsBrowse.items,
      loadingBrands,
      handleBrandClick,
      handleBrandSearch,
      refreshBrands,
      brandModalOpen,
      setBrandModalOpen,
      searchActive,
      searchResultBrands: combinedSearch.brands,
      searchResultObjects: combinedSearch.objects,
      searchValue,
      brandsBrowse,
      combinedSearchPage: combinedSearch,
      searchFacets,
      facetsLoading,
      selectedCategoryIds,
      selectedBrandIds,
      selectedScaleIds,
      selectedSeriesIds,
      onToggleCategory,
      onToggleBrand,
      onToggleScale,
      onToggleSeries,
    }),
    [
      brandsBrowse,
      combinedSearch,
      loadingBrands,
      handleBrandSearch,
      refreshBrands,
      brandModalOpen,
      searchActive,
      searchValue,
      searchFacets,
      facetsLoading,
      selectedCategoryIds,
      selectedBrandIds,
      selectedScaleIds,
      selectedSeriesIds,
    ],
  );
}
