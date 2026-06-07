import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHeader } from "../../HeaderContext";
import useObjectListState from "./useObjectListState";
import BrandsTab from "./BrandsTab";
import GroupsTab from "./GroupsTab";
import BrandModal from "./modals/BrandModal";
import CreateGroupModal from "./modals/CreateGroupModal";
import { discardUploadedImage } from "../../utils";

export default function ObjectList({ isAdmin }) {
  const location = useLocation();
  const { setHeaderSlot } = useHeader();
  const state = useObjectListState({ isAdmin });
  const activeTab = location.pathname === "/groups" ? "groups" : "brands";

  useLayoutEffect(() => {
    setHeaderSlot(null);
  }, [setHeaderSlot]);

  const {
    brands,
    loadingBrands,
    handleBrandClick,
    handleBrandSearch,
    refreshBrands,
    brandModalOpen,
    setBrandModalOpen,
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
    selectedSeriesIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
    onToggleSeries,
    groups,
    loadingGroups,
    handleGroupClick,
    handleGroupSearch,
    groupSearchActive,
    groupSearchResultGroups,
    groupSearchResultObjects,
    groupsListPage,
    groupCombinedSearchPage,
    createGroupModalVisible,
    setCreateGroupModalVisible,
    createGroupLoading,
    groupForm,
    groupImageData,
    setGroupImageData,
    handleCreateGroup,
  } = state;

  return (
    <>
      <div hidden={activeTab !== "brands"}>
        <BrandsTab
          brands={brands}
          loading={loadingBrands}
          onSearch={handleBrandSearch}
          onBrandClick={handleBrandClick}
          isAdmin={isAdmin}
          onCreateBrand={() => setBrandModalOpen(true)}
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
          selectedSeriesIds={selectedSeriesIds}
          onToggleCategory={onToggleCategory}
          onToggleBrand={onToggleBrand}
          onToggleScale={onToggleScale}
          onToggleSeries={onToggleSeries}
        />
      </div>
      <div hidden={activeTab !== "groups"}>
        <GroupsTab
          groups={groups}
          loading={loadingGroups}
          onSearch={handleGroupSearch}
          onGroupClick={handleGroupClick}
          onCreateGroup={() => {
            groupForm.resetFields();
            setCreateGroupModalVisible(true);
          }}
          searchValue={searchValue}
          searchActive={groupSearchActive}
          searchResultGroups={groupSearchResultGroups}
          searchResultObjects={groupSearchResultObjects}
          groupsListPage={groupsListPage}
          combinedSearchPage={groupCombinedSearchPage}
        />
      </div>

      <BrandModal
        open={brandModalOpen}
        brand={null}
        onClose={() => setBrandModalOpen(false)}
        onSuccess={refreshBrands}
      />

      <CreateGroupModal
        visible={createGroupModalVisible}
        onOk={handleCreateGroup}
        onCancel={() => {
          if (groupImageData) discardUploadedImage(groupImageData).catch(() => {});
          setGroupImageData(null);
          setCreateGroupModalVisible(false);
        }}
        confirmLoading={createGroupLoading}
        form={groupForm}
        imageData={groupImageData}
        onImageChange={setGroupImageData}
      />
    </>
  );
}
