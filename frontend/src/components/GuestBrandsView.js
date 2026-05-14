import useBrandsState from "./ObjectList/useBrandsState";
import BrandsTab from "./ObjectList/BrandsTab";

export default function GuestBrandsView() {
  const {
    brands,
    loadingBrands,
    handleBrandClick,
    handleBrandSearch,
  } = useBrandsState();

  return (
    <BrandsTab
      brands={brands}
      loading={loadingBrands}
      onSearch={handleBrandSearch}
      onBrandClick={handleBrandClick}
    />
  );
}
