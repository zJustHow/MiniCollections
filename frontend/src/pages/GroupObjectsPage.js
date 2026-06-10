import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useSearchParam from "../hooks/useSearchParam";
import useRemoteModelSelectSearch from "../hooks/useRemoteModelSelectSearch";
import useReturnSearchRef from "../hooks/useReturnSearchRef";
import useObjectListPageSearch from "../hooks/useObjectListPageSearch";
import useDualModeBrowseList from "../hooks/useDualModeBrowseList";
import { App, Form } from "antd";
import SortableNeuCard from "../components/listPage/SortableNeuCard";
import GroupObjectsPageHeader from "../components/pageHeaders/GroupObjectsPageHeader";
import ObjectListPageShell from "../components/listPage/ObjectListPageShell";
import NoSearchResults from "../components/listPage/NoSearchResults";
import ObjectBrowseSection from "../components/listPage/ObjectBrowseSection";
import SortableInfiniteBrowseSection from "../components/listPage/SortableInfiniteBrowseSection";
import ActivePagePagination from "../components/listPage/ActivePagePagination";
import { createLazyModal } from "../utils/lazyModal";
import { withAddCardSlot } from "../utils/listPageUtils";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import { PAGE_SIZE } from "../utils/apiClient";
import {
  getGroupById,
  getGroupObjectOrder,
  getUserObjectsPage,
  reorderGroupObjects,
  searchGroupObjectsPage,
  updateGroup,
  deleteGroup,
  createUserObject,
} from "../utils/groupsApi";
import { purchasePriceFromFormValue } from "../utils/format";
import { discardUploadedImage } from "../utils/uploadsApi";
import { resolveImageFieldPayload } from "../utils/imageFieldOverride";
import { scrollAppToTop } from "../utils/scroll";

const AddUserObjectInGroupModal = createLazyModal(
  () => import("../components/ObjectList/modals/AddUserObjectInGroupModal"),
);
const EditGroupModal = createLazyModal(
  () => import("../components/ObjectList/modals/EditGroupModal"),
);

export default function GroupObjectsPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();

  const [searchValue, setSearchParam] = useSearchParam();
  const [group, setGroup] = useState(location.state?.group ?? null);
  const returnSearchRef = useReturnSearchRef(location.state?.returnSearch);

  const {
    searchActive,
    searchKeyword,
    draftQuery,
    runSearch,
    handleDraftChange,
  } = useObjectListPageSearch({
    entityKey: groupId,
    searchValue,
    applySearch: setSearchParam,
    clearSearch: () => setSearchParam(""),
  });

  const { browseList, searchList, displayItems } = useDualModeBrowseList({
    entityKey: groupId,
    searchActive,
    searchKeyword,
    pageSize: PAGE_SIZE,
    listResetKey: "group-objects",
    searchResetKey: "group-objects-search",
    fetchListPage: ({ size, page }) =>
      getUserObjectsPage(groupId, { size, page }),
    fetchSearchPage: ({ size, page }) =>
      searchGroupObjectsPage(groupId, searchKeyword, { size, page }),
    fetchOrder: () => getGroupObjectOrder(groupId),
    reorder: (orderedIds) => reorderGroupObjects(groupId, orderedIds),
    listOptions: { reservedFirstPageSlots: 1 },
  });

  const handleObjectReorder = useCallback(
    async (activeId, overId) => {
      const ok = await browseList.handleDragEnd(activeId, overId);
      if (ok === false) {
        message.error(t("failedToReorder"));
      }
    },
    [browseList, message, t],
  );

  const listData = withAddCardSlot(displayItems, !searchActive);

  const [editGroupVisible, setEditGroupVisible] = useState(false);
  const [editGroupLoading, setEditGroupLoading] = useState(false);
  const [editGroupForm] = Form.useForm();
  const [editGroupImageData, setEditGroupImageData] = useState(undefined);

  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [addImageData, setAddImageData] = useState(undefined);
  const {
    results: addSearchResults,
    loading: addSearchLoading,
    onSearch: onAddModelSearch,
    setResults: setAddSearchResults,
  } = useRemoteModelSelectSearch({
    onError: (err) => message.error(err?.message || t("searchFailed")),
  });
  const [selectedBrandObjectForAdd, setSelectedBrandObjectForAdd] =
    useState(null);

  useEffect(() => {
    if (!group) {
      getGroupById(groupId)
        .then(setGroup)
        .catch((err) =>
          message.error(err?.message || t("failedToLoadGroups")),
        );
    }
  }, [groupId, group, message, t]);

  const handleDeleteGroup = async () => {
    if (!group) return;
    try {
      await deleteGroup(group.id);
      message.success(t("groupDeleted"));
      navigate("/groups");
    } catch (err) {
      message.error(err?.message || t("failedToDeleteGroup"));
    }
  };

  const openEditGroup = () => {
    if (!group) return;
    editGroupForm.setFieldsValue({ name: group.name });
    setEditGroupImageData(undefined);
    setEditGroupVisible(true);
  };

  useLayoutEffect(() => {
    scrollAppToTop();
  }, [groupId]);

  useLayoutEffect(() => {
    if (!group) {
      setHeaderSlot(null);
      return () => setHeaderSlot(null);
    }

    setHeaderSlot(
      <GroupObjectsPageHeader
        group={group}
        returnSearch={returnSearchRef.current}
        onEdit={openEditGroup}
        onDelete={handleDeleteGroup}
      />,
    );
    return () => setHeaderSlot(null);
  }, [group, location.pathname, setHeaderSlot]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateGroup = async () => {
    if (!group) return;
    try {
      const values = await editGroupForm.validateFields();
      setEditGroupLoading(true);
      const image_url = resolveImageFieldPayload(
        editGroupImageData,
        group.image_url,
        group.imageUrl,
      );
      try {
        const data = await updateGroup(group.id, {
          name: values.name,
          image_url: image_url || null,
        });
        message.success(t("groupUpdated"));
        setGroup((prev) => ({
          ...prev,
          name: data.name,
          image_url: data.image_url,
        }));
        setEditGroupVisible(false);
      } catch (err) {
        message.error(err?.message || t("failedToUpdateGroup"));
      } finally {
        setEditGroupLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  const handleAddUserObject = async () => {
    if (!group) return;
    try {
      const values = await addForm.validateFields();
      const image_url = resolveImageFieldPayload(
        addImageData,
        selectedBrandObjectForAdd?.image_url,
        selectedBrandObjectForAdd?.imageUrl,
      );
      const payload = {
        brand_object_id: values.brandObjectId ?? null,
        name: values.name,
        image_url: image_url || null,
        purchase_date: values.purchaseDate
          ? values.purchaseDate.format("YYYY-MM-DD")
          : null,
        ...purchasePriceFromFormValue(values.purchasePrice),
        other_notes: values.otherNotes || null,
      };
      setAddLoading(true);
      try {
        await createUserObject(group.id, payload);
        message.success(t("modelAdded"));
        await browseList.refreshAll();
        setAddVisible(false);
      } catch (err) {
        message.error(err?.message || t("failedToAddModel"));
      } finally {
        setAddLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  const openAddUserObject = () => {
    addForm.resetFields();
    setAddImageData(undefined);
    setAddSearchResults([]);
    setSelectedBrandObjectForAdd(null);
    setAddVisible(true);
  };

  const renderBrowseItem = (item) =>
    item.id === "__add__" ? (
      <SortableNeuCard
        key="__add__"
        id="__add__"
        sortEnabled={false}
        add
        name={t("addModel")}
        onClick={openAddUserObject}
      />
    ) : (
      <SortableNeuCard
        key={item.id}
        id={item.id}
        sortEnabled={browseList.sortEnabled}
        name={item.name ?? "—"}
        subtitle={group?.name}
        nameplateVariant="object"
        imageUrl={item.image_url}
        onClick={() =>
          navigate(`/groups/${groupId}/objects/${item.id}`, {
            state: {
              userObject: item,
              group,
              returnSearch: location.search,
            },
          })
        }
      />
    );

  const renderSearchItem = (item) => (
    <SortableNeuCard
      key={item.id}
      id={item.id}
      sortEnabled={false}
      name={item.name ?? "—"}
      subtitle={group?.name}
      nameplateVariant="object"
      imageUrl={item.image_url}
      onClick={() =>
        navigate(`/groups/${groupId}/objects/${item.id}`, {
          state: {
            userObject: item,
            group,
            returnSearch: location.search,
          },
        })
      }
    />
  );

  const searchSpinning = searchList.loading;
  const showNoResults =
    searchActive &&
    displayItems.length === 0 &&
    !searchSpinning;

  return (
    <div>
      <ObjectListPageShell
        searchActive={searchActive}
        searchKeyword={searchKeyword}
        resultPage={searchList}
        searchFieldId="group-objects-search"
        searchFieldName="groupObjectsSearch"
        searchPlaceholder={t("searchModels")}
        draftQuery={draftQuery}
        onDraftChange={handleDraftChange}
        onSearch={runSearch}
      >
        {searchActive ? (
          <>
            {searchSpinning ? (
              <ObjectBrowseSection loading skeletonVariant="object" />
            ) : showNoResults ? (
              <NoSearchResults />
            ) : (
              <ObjectBrowseSection skeletonVariant="object">
                {displayItems.map(renderSearchItem)}
              </ObjectBrowseSection>
            )}
            <ActivePagePagination activePage={searchList} includeTotals={false} />
          </>
        ) : (
          <SortableInfiniteBrowseSection
            loading={browseList.loading}
            orderLoading={browseList.orderLoading}
            items={listData}
            renderItem={renderBrowseItem}
            sortableIds={browseList.orderedIds}
            sortEnabled={browseList.sortEnabled}
            onDragEnd={handleObjectReorder}
            hasMore={browseList.hasMore}
            loadingMore={browseList.loadingMore}
            onLoadMore={browseList.loadMore}
            loadError={browseList.loadError}
            loadMoreError={browseList.loadMoreError}
            errorMessage={t("failedToLoadGroupModels")}
            onRetry={browseList.retry}
            onRetryLoadMore={browseList.retryLoadMore}
            skeletonVariant="object"
          />
        )}
      </ObjectListPageShell>

      <EditGroupModal
        visible={editGroupVisible}
        onOk={handleUpdateGroup}
        onCancel={() => {
          if (editGroupImageData)
            discardUploadedImage(editGroupImageData).catch(() => {});
          setEditGroupImageData(undefined);
          setEditGroupVisible(false);
        }}
        confirmLoading={editGroupLoading}
        form={editGroupForm}
        selectedGroup={group}
        imageData={editGroupImageData}
        onImageChange={setEditGroupImageData}
      />

      <AddUserObjectInGroupModal
        visible={addVisible}
        onOk={handleAddUserObject}
        onCancel={() => {
          if (addImageData) discardUploadedImage(addImageData).catch(() => {});
          setAddImageData(undefined);
          setAddVisible(false);
        }}
        confirmLoading={addLoading}
        form={addForm}
        searchResults={addSearchResults}
        searchLoading={addSearchLoading}
        onSearch={onAddModelSearch}
        onSelectChange={(value) => {
          if (value == null) {
            setSelectedBrandObjectForAdd(null);
            return;
          }
          const bo = addSearchResults.find((o) => o.id === value);
          setSelectedBrandObjectForAdd(bo ?? null);
          if (bo) addForm.setFieldsValue({ name: bo.name ?? "" });
        }}
        imageData={addImageData}
        onImageChange={setAddImageData}
      />
    </div>
  );
}
