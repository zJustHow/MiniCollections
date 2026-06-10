import { useCallback, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toggleInList } from "../utils/filterParams";
import { mutateSearchParams } from "../utils/searchParams";

const CATEGORY_KEY = "categoryIds";
const BRAND_KEY = "brandIds";
const SCALE_KEY = "scaleIds";
const SERIES_KEY = "seriesIds";
const SEARCH_KEY = "q";
const PAGE_KEYS = ["page", "searchPage", "brandPage", "objectPage"];

function parseIds(searchParams, key) {
  return searchParams.getAll(key).map((value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  });
}

export default function useObjectFilterParams({ includeBrands = true } = {}) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigateOptions = useMemo(
    () => ({ replace: true, state: location.state }),
    [location.state],
  );

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
  const selectedSeriesIds = useMemo(
    () => parseIds(searchParams, SERIES_KEY),
    [searchParams],
  );

  const setFilterIds = useCallback(
    (key, ids) => {
      mutateSearchParams(
        setSearchParams,
        (next) => {
          next.delete(key);
          ids.forEach((id) => next.append(key, String(id)));
        },
        navigateOptions,
      );
    },
    [setSearchParams, navigateOptions],
  );

  const clearObjectFilters = useCallback(() => {
    mutateSearchParams(
      setSearchParams,
      (next) => {
        next.delete(CATEGORY_KEY);
        next.delete(BRAND_KEY);
        next.delete(SCALE_KEY);
        next.delete(SERIES_KEY);
      },
      navigateOptions,
    );
  }, [setSearchParams, navigateOptions]);

  const clearSearchAndFilters = useCallback(() => {
    mutateSearchParams(
      setSearchParams,
      (next) => {
        next.delete(SEARCH_KEY);
        next.delete(CATEGORY_KEY);
        next.delete(BRAND_KEY);
        next.delete(SCALE_KEY);
        next.delete(SERIES_KEY);
        PAGE_KEYS.forEach((key) => next.delete(key));
      },
      navigateOptions,
    );
  }, [setSearchParams, navigateOptions]);

  const setSearchQueryClearingFilters = useCallback((query) => {
    const trimmed = (query ?? "").trim();
    mutateSearchParams(
      setSearchParams,
      (next) => {
        next.delete(CATEGORY_KEY);
        next.delete(BRAND_KEY);
        next.delete(SCALE_KEY);
        next.delete(SERIES_KEY);
        PAGE_KEYS.forEach((key) => next.delete(key));
        if (trimmed) {
          next.set(SEARCH_KEY, trimmed);
        } else {
          next.delete(SEARCH_KEY);
        }
      },
      navigateOptions,
    );
  }, [setSearchParams, navigateOptions]);

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

  const onToggleSeries = useCallback(
    (id) => {
      setFilterIds(SERIES_KEY, toggleInList(id, selectedSeriesIds));
    },
    [selectedSeriesIds, setFilterIds],
  );

  return {
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    selectedSeriesIds,
    clearObjectFilters,
    clearSearchAndFilters,
    setSearchQueryClearingFilters,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
    onToggleSeries,
  };
}
