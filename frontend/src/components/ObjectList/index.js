import useObjectListState from "./useObjectListState";
import BrandsTab from "./BrandsTab";
import GroupsTab from "./GroupsTab";
import BrandModal from "./modals/BrandModal";
import CreateGroupModal from "./modals/CreateGroupModal";

export default function ObjectList({ activeTab, isAdmin }) {
  const state = useObjectListState();

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
    brandsListSlice,
    brandsSearchSlice,
    objectsSearchSlice,
    showObjectFilters,
    searchFacets,
    facetsLoading,
    selectedCategoryIds,
    selectedBrandIds,
    selectedScaleIds,
    onToggleCategory,
    onToggleBrand,
    onToggleScale,
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
    onGroupToggleCategory,
    onGroupToggleBrand,
    onGroupToggleScale,
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
          brandsListSlice={brandsListSlice}
          brandsSearchSlice={brandsSearchSlice}
          objectsSearchSlice={objectsSearchSlice}
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
          onToggleCategory={onGroupToggleCategory}
          onToggleBrand={onGroupToggleBrand}
          onToggleScale={onGroupToggleScale}
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
        onCancel={() => setCreateGroupModalVisible(false)}
        confirmLoading={createGroupLoading}
        form={groupForm}
        imageData={groupImageData}
        onImageChange={setGroupImageData}
      />
    </>
  );
}
