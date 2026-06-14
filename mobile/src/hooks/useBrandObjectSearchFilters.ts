import { useCallback, useMemo, useState } from "react";
import { filterKeyFromIds, toggleInList } from "@minicollections/core";

/** Category / scale / series filters for brand-scoped object search (no brand facet). */
export function useBrandObjectSearchFilters() {
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [scaleIds, setScaleIds] = useState<number[]>([]);
  const [seriesIds, setSeriesIds] = useState<number[]>([]);

  const filterKey = useMemo(
    () => filterKeyFromIds(categoryIds, [], scaleIds, seriesIds),
    [categoryIds, scaleIds, seriesIds],
  );

  const activeCount = categoryIds.length + scaleIds.length + seriesIds.length;

  const filterOptions = useMemo(
    () => ({
      ...(categoryIds.length ? { categoryIds } : {}),
      ...(scaleIds.length ? { scaleIds } : {}),
      ...(seriesIds.length ? { seriesIds } : {}),
    }),
    [categoryIds, scaleIds, seriesIds],
  );

  const clearFilters = useCallback(() => {
    setCategoryIds([]);
    setScaleIds([]);
    setSeriesIds([]);
  }, []);

  const toggleCategory = useCallback((id: number) => {
    setCategoryIds((prev) => toggleInList(id, prev) as number[]);
  }, []);

  const toggleScale = useCallback((id: number) => {
    setScaleIds((prev) => toggleInList(id, prev) as number[]);
  }, []);

  const toggleSeries = useCallback((id: number) => {
    setSeriesIds((prev) => toggleInList(id, prev) as number[]);
  }, []);

  return {
    categoryIds,
    scaleIds,
    seriesIds,
    filterKey,
    filterOptions,
    activeCount,
    clearFilters,
    toggleCategory,
    toggleScale,
    toggleSeries,
  };
}
