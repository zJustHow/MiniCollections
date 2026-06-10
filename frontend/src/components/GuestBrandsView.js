import useBrandsState from "./ObjectList/useBrandsState";
import BrandsTab from "./ObjectList/BrandsTab";

export default function GuestBrandsView() {
  const {
    brands,
    loadingBrands,
    handleBrandClick,
    handleBrandSearch,
    searchActive,
    searchResultBrands,
    searchResultObjects,
    searchValue,
    brandsBrowse,
    combinedSearchPage,
    searchFacets,
    facetsLoading,
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    selectedSeriesIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
    onToggleSeries,
  } = useBrandsState();

  return (
    <BrandsTab
      brands={brands}
      onSearch={handleBrandSearch}
      onBrandClick={handleBrandClick}
      searchActive={searchActive}
      searchResultBrands={searchResultBrands}
      searchResultObjects={searchResultObjects}
      searchValue={searchValue}
      brandsBrowse={brandsBrowse}
      combinedSearchPage={combinedSearchPage}
      searchFacets={searchFacets}
      facetsLoading={facetsLoading}
      selectedCategoryIds={selectedCategoryIds}
      selectedBrandIds={selectedBrandIds}
      selectedScaleIds={selectedScaleIds}
      selectedSeriesIds={selectedSeriesIds}
      onToggleCategory={onToggleCategory}
      onToggleBrand={onToggleBrand}
      onToggleScale={onToggleScale}
      onToggleSeries={onToggleSeries}
    />
  );
}
