import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrandByBrandId, searchBrandsForSelect } from "../utils";
import { debounce } from "../utils/debounce";

function brandLabel(brand) {
  return brand.name_en || brand.name_zh || brand.name || String(brand.id);
}

function normalizeBrand(brand) {
  return { ...brand, name: brandLabel(brand) };
}

export default function useRemoteBrandSelect({ enabled = true } = {}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  const loadOptions = useCallback(async (keyword) => {
    if (!enabled) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const brands = await searchBrandsForSelect(keyword);
      if (requestId !== requestIdRef.current) return;
      setOptions(brands.map(normalizeBrand));
    } catch {
      if (requestId === requestIdRef.current) setOptions([]);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [enabled]);

  const loadOptionsRef = useRef(loadOptions);
  loadOptionsRef.current = loadOptions;

  const onSearch = useMemo(
    () => debounce((keyword) => loadOptionsRef.current(keyword), 300),
    [],
  );

  useEffect(() => () => onSearch.cancel(), [onSearch]);

  const ensureBrand = useCallback(async (brandId) => {
    if (brandId == null || brandId === "") return;
    try {
      const brand = await getBrandByBrandId(brandId);
      if (!brand) return;
      setOptions((prev) => {
        if (prev.some((b) => String(b.id) === String(brandId))) return prev;
        return [normalizeBrand(brand), ...prev];
      });
    } catch {
      // ignore missing brand
    }
  }, []);

  const seedBrand = useCallback((brand) => {
    if (!brand?.id) return;
    setOptions((prev) => {
      if (prev.some((b) => String(b.id) === String(brand.id))) return prev;
      return [normalizeBrand(brand), ...prev];
    });
  }, []);

  useEffect(() => {
    if (enabled) loadOptions("");
  }, [enabled, loadOptions]);

  return { options, loading, onSearch, ensureBrand, seedBrand, refresh: () => loadOptions("") };
}
