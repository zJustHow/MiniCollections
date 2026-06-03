import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSearchParam from "../../hooks/useSearchParam";
import useObjectFilterParams from "../../hooks/useObjectFilterParams";
import useInfiniteSlice from "../../hooks/useInfiniteSlice";
import {
  getBrandsSlice,
  searchBrandsSlice,
  searchBrandObjectsSlice,
  searchBrandObjectsFacets,
  SLICE_SIZE,
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

  const brandsList = useInfiniteSlice(
    ({ size, cursor }) => getBrandsSlice({ size, cursor }),
    {
      resetKey: "brands-list",
      enabled: !searchActive,
      pageSize: SLICE_SIZE,
    },
  );

  const brandsSearch = useInfiniteSlice(
    ({ size, cursor }) => searchBrandsSlice(searchKeyword, { size, cursor }),
    {
      resetKey: `brands-search:${searchKeyword}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: SLICE_SIZE,
    },
  );

  const objectFilterKey = filterKeyFromIds(
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
  );

  const objectsSearch = useInfiniteSlice(
    ({ size, cursor }) =>
      searchBrandObjectsSlice(searchKeyword, {
        size,
        cursor,
        categoryIds: selectedCategoryIds,
        brandIds: selectedBrandIds,
        scaleIds: selectedScaleIds,
      }),
    {
      resetKey: `objects-search:${searchKeyword}:${objectFilterKey}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: SLICE_SIZE,
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
    navigate(`/brands/${brand.id}`, { state: { brand } });
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
      brandsSearch.loadInitial();
      objectsSearch.loadInitial();
    } else {
      brandsList.loadInitial();
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
      brandsListSlice: brandsList,
      brandsSearchSlice: brandsSearch,
      objectsSearchSlice: objectsSearch,
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
