import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSearchParam from "../../hooks/useSearchParam";
import { App } from "antd";
import { getBrands, searchBrandsCombined } from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function useBrandsState() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchParam] = useSearchParam();
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchResultBrands, setSearchResultBrands] = useState([]);
  const [searchResultObjects, setSearchResultObjects] = useState([]);

  // Admin: create brand modal
  const [brandModalOpen, setBrandModalOpen] = useState(false);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      message.error(err?.message || t("failedToLoadBrands"));
    } finally {
      setLoadingBrands(false);
    }
  };

  const doSearch = useCallback(async (keyword) => {
    setLoadingBrands(true);
    try {
      const { brands: resultBrands, objects: resultObjects } = await searchBrandsCombined(keyword);
      setSearchResultBrands(resultBrands);
      setSearchResultObjects(resultObjects);
      setSearchActive(true);
    } catch (err) {
      message.error(err?.message || t("failedToSearchBrands"));
    } finally {
      setLoadingBrands(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchBrands();
    if (location.pathname === "/") {
      if (searchValue) doSearch(searchValue);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBrandClick = (brand) => {
    navigate(`/brands/${brand.id}`, { state: { brand } });
  };

  const handleBrandSearch = async (value) => {
    const keyword = value.trim();
    if (!keyword) {
      setSearchParam("");
      setSearchActive(false);
      setSearchResultBrands([]);
      setSearchResultObjects([]);
      return;
    }
    setSearchParam(keyword);
    await doSearch(keyword);
  };

  return {
    brands,
    setBrands,
    loadingBrands,
    handleBrandClick,
    handleBrandSearch,
    refreshBrands: fetchBrands,
    brandModalOpen,
    setBrandModalOpen,
    searchActive,
    searchResultBrands,
    searchResultObjects,
    searchValue,
  };
}
