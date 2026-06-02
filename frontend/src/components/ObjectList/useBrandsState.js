import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSearchParam from "../../hooks/useSearchParam";
import useInfiniteSlice from "../../hooks/useInfiniteSlice";
import {
  getBrandsSlice,
  searchBrandsSlice,
  searchBrandObjectsSlice,
  SLICE_SIZE,
} from "../../utils";

export default function useBrandsState() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchParam] = useSearchParam();
  const [searchActive, setSearchActive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [brandModalOpen, setBrandModalOpen] = useState(false);

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

  const objectsSearch = useInfiniteSlice(
    ({ size, cursor }) => searchBrandObjectsSlice(searchKeyword, { size, cursor }),
    {
      resetKey: `objects-search:${searchKeyword}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: SLICE_SIZE,
    },
  );

  useEffect(() => {
    if (location.pathname !== "/") return;
    const keyword = (searchValue ?? "").trim();
    if (keyword) {
      setSearchKeyword(keyword);
      setSearchActive(true);
    }
  }, [location.pathname, searchValue]);

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
        return;
      }
      setSearchParam(keyword);
      setSearchKeyword(keyword);
      setSearchActive(true);
    },
    [setSearchParam],
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
    ],
  );
}
