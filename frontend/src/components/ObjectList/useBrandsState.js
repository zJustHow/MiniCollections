import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "antd";
import { getBrands, searchBrands } from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function useBrandsState() {
  const { message } = App.useApp();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Admin: create brand modal
  const [brandModalOpen, setBrandModalOpen] = useState(false);

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      message.error(err.message || t("failedToLoadBrands"));
    } finally {
      setLoadingBrands(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBrandClick = (brand) => {
    navigate(`/brands/${brand.id}`, { state: { brand } });
  };

  const handleBrandSearch = async (value) => {
    const keyword = value.trim();
    setLoadingBrands(true);
    try {
      const data = keyword ? await searchBrands(keyword) : await getBrands();
      setBrands(data);
    } catch (err) {
      message.error(err.message || t("failedToSearchBrands"));
    } finally {
      setLoadingBrands(false);
    }
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
  };
}
