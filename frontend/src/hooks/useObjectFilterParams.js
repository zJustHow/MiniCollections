import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toggleInList } from "../utils/filterParams";

const CATEGORY_KEY = "categoryIds";
const BRAND_KEY = "brandIds";
const SCALE_KEY = "scaleIds";

function parseIds(searchParams, key) {
  return searchParams.getAll(key).map((value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  });
}

export default function useObjectFilterParams({ includeBrands = true } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategoryIds = useMemo(
    () => parseIds(searchParams, CATEGORY_KEY),
    [searchParams],
  );
  const selectedBrandIds = useMemo(
    () => (includeBrands ? parseIds(searchParams, BRAND_KEY) : []),
    [searchParams, includeBrands],
  );
  const selectedScaleIds = useMemo(
    () => parseIds(searchParams, SCALE_KEY),
    [searchParams],
  );

  const setFilterIds = useCallback(
    (key, ids) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(key);
          ids.forEach((id) => next.append(key, String(id)));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearObjectFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(CATEGORY_KEY);
        next.delete(BRAND_KEY);
        next.delete(SCALE_KEY);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const onToggleCategory = useCallback(
    (id) => {
      setFilterIds(CATEGORY_KEY, toggleInList(id, selectedCategoryIds));
    },
    [selectedCategoryIds, setFilterIds],
  );

  const onToggleBrand = useCallback(
    (id) => {
      if (!includeBrands) return;
      setFilterIds(BRAND_KEY, toggleInList(id, selectedBrandIds));
    },
    [includeBrands, selectedBrandIds, setFilterIds],
  );

  const onToggleScale = useCallback(
    (id) => {
      setFilterIds(SCALE_KEY, toggleInList(id, selectedScaleIds));
    },
    [selectedScaleIds, setFilterIds],
  );

  return {
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    clearObjectFilters,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
  };
}
