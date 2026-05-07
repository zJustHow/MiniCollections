import { useEffect, useState } from "react";
import {
  App, Form } from "antd";
import {
  adminDeleteBrand,
  adminDeleteBrandObject,
  getBrands,
  getBrandObjectsByBrandId,
  searchBrands,
} from "../../utils";
import { useLocale } from "../../LocaleContext";

export default function useBrandsState() {
  const { message } = App.useApp(); const { t } = useLocale();
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandObjects, setBrandObjects] = useState([]);
  const [loadingBrandObjects, setLoadingBrandObjects] = useState(false);
  const [brandObjectSearchKeyword, setBrandObjectSearchKeyword] = useState("");

  // Admin modal state
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandObjectModalOpen, setBrandObjectModalOpen] = useState(false);
  const [editingBrandObject, setEditingBrandObject] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [brandForm] = Form.useForm();

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

  const refreshBrandObjects = async (brandId) => {
    if (!brandId) return;
    setLoadingBrandObjects(true);
    try {
      const data = await getBrandObjectsByBrandId(brandId);
      setBrandObjects(data);
    } catch (err) {
      message.error(err.message || t("failedToLoadModels"));
    } finally {
      setLoadingBrandObjects(false);
    }
  };

  const handleBrandClick = async (brand) => {
    setSelectedBrand(brand);
    setBrandDrawerOpen(true);
    await refreshBrandObjects(brand.id);
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

  // Admin: open brand modal
  const openCreateBrandModal = () => {
    setEditingBrand(null);
    setBrandModalOpen(true);
  };

  const openEditBrandModal = (brand) => {
    setEditingBrand(brand);
    setBrandModalOpen(true);
  };

  const handleAdminDeleteBrand = async (brand) => {
    try {
      await adminDeleteBrand(brand.id);
      message.success(t("brandDeleted"));
      setBrandDrawerOpen(false);
      await fetchBrands();
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrand"));
    }
  };

  // Admin: open brand object modal
  const openCreateBrandObjectModal = () => {
    setEditingBrandObject(null);
    setBrandObjectModalOpen(true);
  };

  const openEditBrandObjectModal = (brandObject) => {
    setEditingBrandObject(brandObject);
    setBrandObjectModalOpen(true);
  };

  const handleAdminDeleteBrandObject = async (obj) => {
    try {
      await adminDeleteBrandObject(obj.id);
      message.success(t("brandObjectDeleted"));
      await refreshBrandObjects(selectedBrand?.id);
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrandObject"));
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
    refreshBrands: fetchBrands,
    refreshBrandObjects,
    // Admin modal state
    brandModalOpen,
    setBrandModalOpen,
    editingBrand,
    brandObjectModalOpen,
    setBrandObjectModalOpen,
    editingBrandObject,
    // Admin handlers
    openCreateBrandModal,
    openEditBrandModal,
    handleAdminDeleteBrand,
    openCreateBrandObjectModal,
    openEditBrandObjectModal,
    handleAdminDeleteBrandObject,
  };
}
