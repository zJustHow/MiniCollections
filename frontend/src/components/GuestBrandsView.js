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
    brandsListSlice,
    brandsSearchSlice,
    objectsSearchSlice,
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
      brandsListSlice={brandsListSlice}
      brandsSearchSlice={brandsSearchSlice}
      objectsSearchSlice={objectsSearchSlice}
    />
  );
}
