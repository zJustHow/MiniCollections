import { Tabs } from "antd";
import useObjectListState from "./useObjectListState";
import BrandsTab from "./BrandsTab";
import GroupsTab from "./GroupsTab";
import BrandDrawer from "./BrandDrawer";
import GroupDrawer from "./GroupDrawer";
import AddToGroupModal from "./modals/AddToGroupModal";
import AddUserObjectInGroupModal from "./modals/AddUserObjectInGroupModal";
import CreateGroupModal from "./modals/CreateGroupModal";
import EditGroupModal from "./modals/EditGroupModal";
import BrandObjectDetailModal from "./modals/BrandObjectDetailModal";
import UserObjectDetailModal from "./modals/UserObjectDetailModal";
import EditUserObjectModal from "./modals/EditUserObjectModal";

const { TabPane } = Tabs;

export default function ObjectList() {
  const state = useObjectListState();

  const {
    brands,
    groups,
    loadingBrands,
    loadingGroups,
    brandDrawerOpen,
    setBrandDrawerOpen,
    groupDrawerOpen,
    setGroupDrawerOpen,
    selectedBrand,
    selectedGroup,
    selectedGroupUserObjects,
    loadingGroupUserObjects,
    brandObjectSearchKeyword,
    setBrandObjectSearchKeyword,
    groupUserObjectSearchKeyword,
    setGroupUserObjectSearchKeyword,
    brandObjects,
    loadingBrandObjects,
    createModalVisible,
    setCreateModalVisible,
    createModalLoading,
    selectedBrandObject,
    form,
    customImageData,
    setCustomImageData,
    brandObjectDetailVisible,
    setBrandObjectDetailVisible,
    brandObjectDetail,
    userObjectDetailVisible,
    setUserObjectDetailVisible,
    selectedUserObject,
    userObjectBrandDetail,
    loadingUserObjectBrandDetail,
    createGroupModalVisible,
    setCreateGroupModalVisible,
    createGroupLoading,
    groupForm,
    groupImageData,
    setGroupImageData,
    editGroupModalVisible,
    setEditGroupModalVisible,
    editGroupLoading,
    editGroupForm,
    editGroupImageData,
    setEditGroupImageData,
    editUserObjectModalVisible,
    setEditUserObjectModalVisible,
    editUserObjectLoading,
    editUserObjectForm,
    editUserObjectImageData,
    setEditUserObjectImageData,
    editModelSearchResults,
    setEditModelSearchResults,
    editModelSearchLoading,
    setEditModelSearchLoading,
    addUserObjectInGroupModalVisible,
    setAddUserObjectInGroupModalVisible,
    addUserObjectInGroupLoading,
    addUserObjectInGroupForm,
    addUserObjectInGroupImageData,
    setAddUserObjectInGroupImageData,
    addModelSearchResults,
    setAddModelSearchResults,
    addModelSearchLoading,
    setAddModelSearchLoading,
    setSelectedBrandObjectForAdd,
    handleBrandClick,
    handleGroupClick,
    handleBrandObjectClick,
    handleUserObjectClick,
    openCreateModal,
    handleCreateUserObject,
    handleBrandSearch,
    handleGroupSearch,
    openEditGroupModal,
    handleUpdateGroup,
    handleDeleteGroup,
    openEditUserObjectModal,
    handleUpdateUserObject,
    handleDeleteUserObject,
    openAddUserObjectInGroupModal,
    handleAddUserObjectInGroup,
    setBrandObjectDetailFromUserObject,
    handleCreateGroup,
    searchBrandObjects,
    message,
  } = state;

  return (
    <>
      <Tabs defaultActiveKey="brands">
        <TabPane tab="Brands" key="brands">
          <BrandsTab
            brands={brands}
            loading={loadingBrands}
            onSearch={handleBrandSearch}
            onBrandClick={handleBrandClick}
          />
        </TabPane>
        <TabPane tab="My Groups" key="groups">
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
        </TabPane>
      </Tabs>

      <BrandDrawer
        open={brandDrawerOpen}
        onClose={() => setBrandDrawerOpen(false)}
        selectedBrand={selectedBrand}
        brandObjects={brandObjects}
        loading={loadingBrandObjects}
        searchKeyword={brandObjectSearchKeyword}
        onSearchChange={setBrandObjectSearchKeyword}
        onBrandObjectClick={handleBrandObjectClick}
        onAddToGroup={openCreateModal}
      />

      <GroupDrawer
        open={groupDrawerOpen}
        onClose={() => setGroupDrawerOpen(false)}
        selectedGroup={selectedGroup}
        userObjects={selectedGroupUserObjects}
        loading={loadingGroupUserObjects}
        searchKeyword={groupUserObjectSearchKeyword}
        onSearchChange={setGroupUserObjectSearchKeyword}
        onUserObjectClick={handleUserObjectClick}
        onEditGroup={openEditGroupModal}
        onDeleteGroup={handleDeleteGroup}
        onAddModel={openAddUserObjectInGroupModal}
      />

      <AddUserObjectInGroupModal
        visible={addUserObjectInGroupModalVisible}
        onOk={handleAddUserObjectInGroup}
        onCancel={() => setAddUserObjectInGroupModalVisible(false)}
        confirmLoading={addUserObjectInGroupLoading}
        form={addUserObjectInGroupForm}
        searchResults={addModelSearchResults}
        searchLoading={addModelSearchLoading}
        onSearch={async (value) => {
          const keyword = (value || "").trim();
          if (keyword === "") {
            setAddModelSearchResults([]);
            return;
          }
          setAddModelSearchLoading(true);
          try {
            const data = await searchBrandObjects(keyword);
            setAddModelSearchResults(Array.isArray(data) ? data : []);
          } catch (err) {
            message.error(err?.message || "Search failed");
            setAddModelSearchResults([]);
          } finally {
            setAddModelSearchLoading(false);
          }
        }}
        onSelectChange={(value) => {
          if (value == null) {
            setSelectedBrandObjectForAdd(null);
            return;
          }
          const bo = addModelSearchResults.find((o) => o.id === value);
          setSelectedBrandObjectForAdd(bo ?? null);
          if (bo) {
            addUserObjectInGroupForm.setFieldsValue({ name: bo.name ?? "" });
          }
        }}
        imageData={addUserObjectInGroupImageData}
        onImageChange={setAddUserObjectInGroupImageData}
      />

      <AddToGroupModal
        visible={createModalVisible}
        onOk={handleCreateUserObject}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={createModalLoading}
        form={form}
        groups={groups}
        selectedBrandObject={selectedBrandObject}
        customImageData={customImageData}
        onImageChange={setCustomImageData}
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

      <EditGroupModal
        visible={editGroupModalVisible}
        onOk={handleUpdateGroup}
        onCancel={() => setEditGroupModalVisible(false)}
        confirmLoading={editGroupLoading}
        form={editGroupForm}
        selectedGroup={selectedGroup}
        imageData={editGroupImageData}
        onImageChange={setEditGroupImageData}
      />

      <BrandObjectDetailModal
        visible={brandObjectDetailVisible}
        onCancel={() => setBrandObjectDetailVisible(false)}
        detail={brandObjectDetail}
      />

      <UserObjectDetailModal
        visible={userObjectDetailVisible}
        onCancel={() => setUserObjectDetailVisible(false)}
        userObject={selectedUserObject}
        brandDetail={userObjectBrandDetail}
        loadingBrandDetail={loadingUserObjectBrandDetail}
        onEdit={openEditUserObjectModal}
        onDelete={handleDeleteUserObject}
        onBrandObjectClick={setBrandObjectDetailFromUserObject}
      />

      <EditUserObjectModal
        visible={editUserObjectModalVisible}
        onOk={handleUpdateUserObject}
        onCancel={() => setEditUserObjectModalVisible(false)}
        confirmLoading={editUserObjectLoading}
        form={editUserObjectForm}
        searchResults={editModelSearchResults}
        searchLoading={editModelSearchLoading}
        onSearch={async (value) => {
          const keyword = (value || "").trim();
          if (keyword === "") {
            setEditModelSearchResults(
              userObjectBrandDetail ? [userObjectBrandDetail] : [],
            );
            return;
          }
          setEditModelSearchLoading(true);
          try {
            const data = await searchBrandObjects(keyword);
            setEditModelSearchResults(Array.isArray(data) ? data : []);
          } catch (err) {
            message.error(err?.message || "Search failed");
            setEditModelSearchResults([]);
          } finally {
            setEditModelSearchLoading(false);
          }
        }}
        imageData={editUserObjectImageData}
        selectedUserObject={selectedUserObject}
        onImageChange={setEditUserObjectImageData}
      />
    </>
  );
}
