import { useEffect, useState } from "react";
import { Form, message } from "antd";
import {
  getBrands,
  searchBrands,
  getBrandObjectsByBrandId,
} from "../../utils";

export default function useBrandsState() {
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandObjects, setBrandObjects] = useState([]);
  const [loadingBrandObjects, setLoadingBrandObjects] = useState(false);
  const [brandObjectSearchKeyword, setBrandObjectSearchKeyword] =
    useState("");

  // Reserved: if brand-related forms are added later, centralize Form management here.
  // Not exposed externally yet; omit export if unused.
  // eslint-disable-next-line no-unused-vars
  const [brandForm] = Form.useForm();

  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const data = await getBrands();
        setBrands(data);
      } catch (err) {
        message.error(err.message || "Failed to load brands");
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  const handleBrandClick = async (brand) => {
    setSelectedBrand(brand);
    setBrandDrawerOpen(true);
    setLoadingBrandObjects(true);
    try {
      const data = await getBrandObjectsByBrandId(brand.id);
      setBrandObjects(data);
    } catch (err) {
      message.error(err.message || "Failed to load models");
    } finally {
      setLoadingBrandObjects(false);
    }
  };

  const handleBrandSearch = async (value) => {
    const keyword = value.trim();
    setLoadingBrands(true);
    try {
      const data = keyword ? await searchBrands(keyword) : await getBrands();
      setBrands(data);
    } catch (err) {
      message.error(err.message || "Failed to search brands");
    } finally {
      setLoadingBrands(false);
    }
  };

  return {
    brands,
    setBrands,
    loadingBrands,
    brandDrawerOpen,
    setBrandDrawerOpen,
    selectedBrand,
    brandObjects,
    loadingBrandObjects,
    brandObjectSearchKeyword,
    setBrandObjectSearchKeyword,
    handleBrandClick,
    handleBrandSearch,
  };
}

