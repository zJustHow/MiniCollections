import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSearchParam from "../../hooks/useSearchParam";
import useObjectFilterParams from "../../hooks/useObjectFilterParams";
import usePagedList from "../../hooks/usePagedList";
import {
  getBrandsPage,
  searchBrandsPage,
  searchBrandObjectsPage,
  searchBrandObjectsFacets,
  PAGE_SIZE,
} from "../../utils";
import { filterKeyFromIds } from "../../utils/filterParams";

export default function useBrandsState() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchParam] = useSearchParam();
  const {
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    clearObjectFilters,
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

  const brandsSearch = usePagedList(
    ({ size, page }) => searchBrandsPage(searchKeyword, { size, page }),
    {
      resetKey: `brands-search:${searchKeyword}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: PAGE_SIZE,
      pageParamKey: "brandPage",
    },
  );

  const objectFilterKey = filterKeyFromIds(
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
  );

  const objectsSearch = usePagedList(
    ({ size, page }) =>
      searchBrandObjectsPage(searchKeyword, {
        size,
        page,
        categoryIds: selectedCategoryIds,
        brandIds: selectedBrandIds,
        scaleIds: selectedScaleIds,
      }),
    {
      resetKey: `objects-search:${searchKeyword}:${objectFilterKey}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: PAGE_SIZE,
      pageParamKey: "objectPage",
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
        setSearchParam("");
        setSearchKeyword("");
        setSearchActive(false);
        clearObjectFilters();
        setSearchFacets(null);
        syncedKeywordRef.current = "";
        return;
      }
      if (keyword !== syncedKeywordRef.current) {
        clearObjectFilters();
        syncedKeywordRef.current = keyword;
      }
      setSearchParam(keyword);
      setSearchKeyword(keyword);
      setSearchActive(true);
    },
    [setSearchParam, clearObjectFilters],
  );

  const refreshBrands = useCallback(() => {
    if (searchActive) {
      brandsSearch.loadPage(0);
      objectsSearch.loadPage(0);
    } else {
      brandsList.loadPage(0);
    }
  }, [searchActive, brandsList, brandsSearch, objectsSearch]);

  const loadingBrands = searchActive
    ? brandsSearch.loading || objectsSearch.loading
    : brandsList.loading;

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
      searchResultBrands: brandsSearch.items,
      searchResultObjects: objectsSearch.items,
      searchValue,
      brandsListPage: brandsList,
      brandsSearchPage: brandsSearch,
      objectsSearchPage: objectsSearch,
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
      brandsSearch,
      objectsSearch,
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
