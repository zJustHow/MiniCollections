import useObjectListState from "./useObjectListState";
import BrandsTab from "./BrandsTab";
import GroupsTab from "./GroupsTab";
import BrandModal from "./modals/BrandModal";
import CreateGroupModal from "./modals/CreateGroupModal";
import { discardUploadedImage } from "../../utils";

export default function ObjectList({ activeTab, isAdmin }) {
  const state = useObjectListState({ isAdmin });

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
    groupShowObjectFilters,
    groupSearchFacets,
    groupFacetsLoading,
    groupSelectedCategoryIds,
    groupSelectedBrandIds,
    groupSelectedScaleIds,
    groupSelectedSeriesIds,
    onGroupToggleCategory,
    onGroupToggleBrand,
    onGroupToggleScale,
    onGroupToggleSeries,
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
      {activeTab === "brands" ? (
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
      ) : (
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
          showObjectFilters={groupShowObjectFilters}
          searchFacets={groupSearchFacets}
          facetsLoading={groupFacetsLoading}
          selectedCategoryIds={groupSelectedCategoryIds}
          selectedBrandIds={groupSelectedBrandIds}
          selectedScaleIds={groupSelectedScaleIds}
          selectedSeriesIds={groupSelectedSeriesIds}
          onToggleCategory={onGroupToggleCategory}
          onToggleBrand={onGroupToggleBrand}
          onToggleScale={onGroupToggleScale}
          onToggleSeries={onGroupToggleSeries}
        />
      )}

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
