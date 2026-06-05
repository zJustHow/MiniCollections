import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSearchParam from "../../hooks/useSearchParam";
import useObjectFilterParams from "../../hooks/useObjectFilterParams";
import usePagedList from "../../hooks/usePagedList";
import useCombinedBrandSearch from "../../hooks/useCombinedBrandSearch";
import {
  getBrandsPage,
  searchBrandsCombinedPage,
  searchBrandObjectsFacets,
  PAGE_SIZE,
} from "../../utils";
import { filterKeyFromIds } from "../../utils/filterParams";

export default function useBrandsState() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue] = useSearchParam();
  const {
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    clearObjectFilters,
    clearSearchAndFilters,
    setSearchQueryClearingFilters,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
  } = useObjectFilterParams();
  const [searchActive, setSearchActive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchFacets, setSearchFacets] = useState(null);
  const [facetsLoading, setFacetsLoading] = useState(false);

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const syncedKeywordRef = useRef((searchValue ?? "").trim());

  const brandsList = usePagedList(
    ({ size, page }) => getBrandsPage({ size, page }),
    {
      resetKey: "brands-list",
      enabled: !searchActive,
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
    },
  );

  const objectFilterKey = filterKeyFromIds(
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
  );

  const combinedSearch = useCombinedBrandSearch(
    ({ size, page }) =>
      searchBrandsCombinedPage(searchKeyword, {
        size,
        page,
        categoryIds: selectedCategoryIds,
        brandIds: selectedBrandIds,
        scaleIds: selectedScaleIds,
      }),
    {
      resetKey: `combined-search:${searchKeyword}:${objectFilterKey}`,
      enabled: searchActive && Boolean(searchKeyword),
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
      setSearchFacets(null);
    }
  }, [location.pathname, searchValue, clearObjectFilters]);

  useEffect(() => {
    if (!searchActive || !searchKeyword) {
      setSearchFacets(null);
      return undefined;
    }

    let cancelled = false;
    setFacetsLoading(true);
    searchBrandObjectsFacets(searchKeyword)
      .then((data) => {
        if (!cancelled) {
          setSearchFacets(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchFacets({ total: 0, categories: [], brands: [], scales: [] });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFacetsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchKeyword, searchActive, clearObjectFilters]);

  const handleBrandClick = (brand) => {
    const returnSearch = location.search;
    const nextSearch = new URLSearchParams(location.search);
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
        setSearchFacets(null);
        syncedKeywordRef.current = "";
        return;
      }
      if (keyword !== syncedKeywordRef.current) {
        setSearchQueryClearingFilters(keyword);
        syncedKeywordRef.current = keyword;
      }
      setSearchKeyword(keyword);
      setSearchActive(true);
    },
    [clearSearchAndFilters, setSearchQueryClearingFilters],
  );

  const refreshBrands = useCallback(() => {
    if (searchActive) {
      combinedSearch.loadPage(0);
    } else {
      brandsList.loadPage(0);
    }
  }, [searchActive, brandsList, combinedSearch]);

  const loadingBrands = searchActive ? combinedSearch.loading : brandsList.loading;

  const showObjectFilters =
    searchActive &&
    Boolean(searchKeyword) &&
    searchFacets != null &&
    ((searchFacets.categories?.length ?? 0) > 0 ||
      (searchFacets.brands?.length ?? 0) > 0 ||
      (searchFacets.scales?.length ?? 0) > 0);

  return useMemo(
    () => ({
      brands: brandsList.items,
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
      brandsListPage: brandsList,
      combinedSearchPage: combinedSearch,
      showObjectFilters,
      searchFacets,
      facetsLoading,
      selectedCategoryIds,
      selectedBrandIds,
      selectedScaleIds,
      onToggleCategory,
      onToggleBrand,
      onToggleScale,
    }),
    [
      brandsList,
      combinedSearch,
      loadingBrands,
      handleBrandSearch,
      refreshBrands,
      brandModalOpen,
      searchActive,
      searchValue,
      showObjectFilters,
      searchFacets,
      facetsLoading,
      selectedCategoryIds,
      selectedBrandIds,
      selectedScaleIds,
    ],
  );
}
