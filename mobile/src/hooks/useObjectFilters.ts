import { useCallback, useMemo, useState } from "react";
import { filterKeyFromIds, toggleInList } from "@minicollections/core";

export function useObjectFilters() {
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [scaleIds, setScaleIds] = useState<number[]>([]);
  const [seriesIds, setSeriesIds] = useState<number[]>([]);

  const filterKey = useMemo(
    () => filterKeyFromIds(categoryIds, brandIds, scaleIds, seriesIds),
    [brandIds, categoryIds, scaleIds, seriesIds],
  );

  const activeCount =
    categoryIds.length + brandIds.length + scaleIds.length + seriesIds.length;

  const clearFilters = useCallback(() => {
    setCategoryIds([]);
    setBrandIds([]);
    setScaleIds([]);
    setSeriesIds([]);
  }, []);

  const toggleCategory = useCallback((id: number) => {
    setCategoryIds((prev) => toggleInList(id, prev) as number[]);
  }, []);

  const toggleBrand = useCallback((id: number) => {
    setBrandIds((prev) => toggleInList(id, prev) as number[]);
  }, []);

  const toggleScale = useCallback((id: number) => {
    setScaleIds((prev) => toggleInList(id, prev) as number[]);
  }, []);

  const toggleSeries = useCallback((id: number) => {
    setSeriesIds((prev) => toggleInList(id, prev) as number[]);
  }, []);

  return {
    categoryIds,
    brandIds,
    scaleIds,
    seriesIds,
    filterKey,
    activeCount,
    clearFilters,
    toggleCategory,
    toggleBrand,
    toggleScale,
    toggleSeries,
  };
}
