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
    brandsListPage,
    combinedSearchPage,
    showObjectFilters,
    searchFacets,
    facetsLoading,
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
  } = useBrandsState();

  return (
    <BrandsTab
      brands={brands}
      loading={loadingBrands}
      onSearch={handleBrandSearch}
      onBrandClick={handleBrandClick}
      searchActive={searchActive}
      searchResultBrands={searchResultBrands}
      searchResultObjects={searchResultObjects}
      searchValue={searchValue}
      brandsListPage={brandsListPage}
      combinedSearchPage={combinedSearchPage}
      showObjectFilters={showObjectFilters}
      searchFacets={searchFacets}
      facetsLoading={facetsLoading}
      selectedCategoryIds={selectedCategoryIds}
      selectedBrandIds={selectedBrandIds}
      selectedScaleIds={selectedScaleIds}
      onToggleCategory={onToggleCategory}
      onToggleBrand={onToggleBrand}
      onToggleScale={onToggleScale}
    />
  );
}
