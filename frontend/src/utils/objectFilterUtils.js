export const EMPTY_SEARCH_FACETS = {
  total: 0,
  categories: [],
  brands: [],
  scales: [],
  series: [],
};

export function hasFacetOptions(facets, { includeBrands = true } = {}) {
  if (!facets) return false;
  return (
    (facets.categories?.length ?? 0) > 0 ||
    (includeBrands && (facets.brands?.length ?? 0) > 0) ||
    (facets.scales?.length ?? 0) > 0 ||
    (facets.series?.length ?? 0) > 0
  );
}

export function resolveFilterColumnState({
  searchActive,
  searchKeyword,
  searchFacets,
  facetsLoading,
  includeBrands = true,
}) {
  const showObjectFilters =
    searchActive &&
    Boolean(searchKeyword) &&
    searchFacets != null &&
    hasFacetOptions(searchFacets, { includeBrands });
  const showFilterColumn = showObjectFilters || (searchActive && facetsLoading);
  return { showObjectFilters, showFilterColumn };
}

export function buildFilterLayoutProps({
  showFilterColumn,
  searchFacets,
  facetsLoading,
  selectedCategoryIds,
  selectedBrandIds = [],
  selectedScaleIds,
  selectedSeriesIds = [],
  onToggleCategory,
  onToggleBrand = () => {},
  onToggleScale,
  onToggleSeries = () => {},
}) {
  return {
    showFilterColumn,
    facets: searchFacets,
    loading: facetsLoading,
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    selectedSeriesIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
    onToggleSeries,
  };
}
