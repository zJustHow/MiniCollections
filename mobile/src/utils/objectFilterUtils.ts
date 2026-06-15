import type { SearchFacets } from "../components/ObjectSearchFilterPanel";

export function hasFacetOptions(
  facets: SearchFacets | null | undefined,
  { includeBrands = true }: { includeBrands?: boolean } = {},
) {
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
}: {
  searchActive: boolean;
  searchKeyword: string;
  searchFacets: SearchFacets | null | undefined;
  facetsLoading: boolean;
  includeBrands?: boolean;
}) {
  const showObjectFilters =
    searchActive &&
    Boolean(searchKeyword.trim()) &&
    searchFacets != null &&
    hasFacetOptions(searchFacets, { includeBrands });
  const showFilterColumn = showObjectFilters || (searchActive && facetsLoading);
  return { showObjectFilters, showFilterColumn };
}
