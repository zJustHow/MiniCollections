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
    groups,
    loadingGroups,
    handleGroupClick,
    handleGroupSearch,
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
