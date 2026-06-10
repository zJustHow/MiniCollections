import useGroupsState from "./useGroupsState";
import GroupsTab from "./GroupsTab";
import { createLazyModal } from "../../utils/lazyModal";
import { discardUploadedImage } from "../../utils/uploadsApi";

const CreateGroupModal = createLazyModal(() => import("./modals/CreateGroupModal"));

export default function GroupsTabContainer() {
  const {
    groups,
    handleGroupClick,
    handleGroupSearch,
    handleGroupReorder,
    searchValue,
    groupSearchActive,
    groupSearchResultGroups,
    groupSearchResultObjects,
    groupsBrowse,
    groupCombinedSearchPage,
    createGroupModalVisible,
    setCreateGroupModalVisible,
    createGroupLoading,
    groupForm,
    groupImageData,
    setGroupImageData,
    handleCreateGroup,
  } = useGroupsState();

  return (
    <>
      <GroupsTab
        groups={groups}
        onSearch={handleGroupSearch}
        onGroupClick={handleGroupClick}
        onGroupReorder={handleGroupReorder}
        onCreateGroup={() => {
          groupForm.resetFields();
          setCreateGroupModalVisible(true);
        }}
        searchValue={searchValue}
        searchActive={groupSearchActive}
        searchResultGroups={groupSearchResultGroups}
        searchResultObjects={groupSearchResultObjects}
        groupsBrowse={groupsBrowse}
        combinedSearchPage={groupCombinedSearchPage}
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
