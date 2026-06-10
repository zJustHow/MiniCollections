import { Suspense, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHeader } from "../../HeaderContext";
import useBrandsState from "./useBrandsState";
import BrandsTab from "./BrandsTab";
import NeuCardGridSkeleton from "../NeuCardGridSkeleton";
import { createLazyModal } from "../../utils/lazyModal";
import { lazyWithRetry } from "../../utils/lazyWithRetry";

const BrandModal = createLazyModal(() => import("./modals/BrandModal"));
const GroupsTabContainer = lazyWithRetry(() => import("./GroupsTabContainer"));

export default function ObjectList({ isAdmin }) {
  const location = useLocation();
  const { headerSlot, setHeaderSlot } = useHeader();
  const brandsState = useBrandsState({ isAdmin });
  const activeTab = location.pathname === "/groups" ? "groups" : "brands";

  useLayoutEffect(() => {
    if (headerSlot !== null) {
      setHeaderSlot(null);
    }
  }, [location.pathname, headerSlot, setHeaderSlot]);

  const {
    brands,
    handleBrandClick,
    handleBrandSearch,
    refreshBrands,
    brandModalOpen,
    setBrandModalOpen,
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
  } = brandsState;

  return (
    <>
      {activeTab === "brands" ? (
        <BrandsTab
          brands={brands}
          onSearch={handleBrandSearch}
          onBrandClick={handleBrandClick}
          isAdmin={isAdmin}
          onCreateBrand={() => setBrandModalOpen(true)}
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
      ) : null}
      {activeTab === "groups" ? (
        <Suspense fallback={<NeuCardGridSkeleton reserveSearchRow />}>
          <GroupsTabContainer />
        </Suspense>
      ) : null}

      <BrandModal
        open={brandModalOpen}
        brand={null}
        onClose={() => setBrandModalOpen(false)}
        onSuccess={refreshBrands}
      />
    </>
  );
}
