import useBrandsState from "./ObjectList/useBrandsState";
import BrandsTab from "./ObjectList/BrandsTab";
import BrandDrawer from "./ObjectList/BrandDrawer";

export default function GuestBrandsView({ onAuthRequired }) {
  const {
    brands,
    loadingBrands,
    brandDrawerOpen,
    setBrandDrawerOpen,
    selectedBrand,
    brandObjects,
    loadingBrandObjects,
    brandObjectSearchKeyword,
    setBrandObjectSearchKeyword,
    handleBrandClick,
    handleBrandSearch,
  } = useBrandsState();

  return (
    <>
      <BrandsTab
        brands={brands}
        loading={loadingBrands}
        onSearch={handleBrandSearch}
        onBrandClick={handleBrandClick}
      />
      <BrandDrawer
        open={brandDrawerOpen}
        onClose={() => setBrandDrawerOpen(false)}
        selectedBrand={selectedBrand}
        brandObjects={brandObjects}
        loading={loadingBrandObjects}
        searchKeyword={brandObjectSearchKeyword}
        onSearchChange={setBrandObjectSearchKeyword}
        onAddToGroup={onAuthRequired}
      />
    </>
  );
}
