import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useSearchParam from "../hooks/useSearchParam";
import usePagedList from "../hooks/usePagedList";
import useRemoteModelSelectSearch from "../hooks/useRemoteModelSelectSearch";
import { App, Form, Spin } from "antd";
import NeuCard from "../components/NeuCard";
import GroupObjectsPageHeader from "../components/pageHeaders/GroupObjectsPageHeader";
import { NeuInput } from "../components/NeuFormControl";
import ListPagination from "../components/ListPagination";
import AddUserObjectInGroupModal from "../components/ObjectList/modals/AddUserObjectInGroupModal";
import ObjectListPageLayout from "../components/ObjectListPageLayout";
import SearchResultsSummary from "../components/SearchResultsSummary";
import EditGroupModal from "../components/ObjectList/modals/EditGroupModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getGroupById,
  getUserObjectsPage,
  searchGroupObjectsPage,
  updateGroup,
  deleteGroup,
  createUserObject,
  purchasePriceFromFormValue,
  discardUploadedImage,
  PAGE_SIZE,
} from "../utils";
import { scrollAppToTop } from "../utils/scroll";

const { Search } = NeuInput;

export default function GroupObjectsPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();

  const [searchValue, setSearchParam] = useSearchParam();
  const [group, setGroup] = useState(location.state?.group ?? null);
  const [searchActive, setSearchActive] = useState(Boolean((searchValue ?? "").trim()));
  const [searchKeyword, setSearchKeyword] = useState((searchValue ?? "").trim());
  const [draftQuery, setDraftQuery] = useState(searchValue);
  const syncedKeywordRef = useRef(searchKeyword);
  const returnSearchRef = useRef(location.state?.returnSearch ?? "");

  useEffect(() => {
    if (location.state?.returnSearch != null) {
      returnSearchRef.current = location.state.returnSearch;
    }
  }, [location.state?.returnSearch]);

  const [editGroupVisible, setEditGroupVisible] = useState(false);
  const [editGroupLoading, setEditGroupLoading] = useState(false);
  const [editGroupForm] = Form.useForm();
  const [editGroupImageData, setEditGroupImageData] = useState(null);

  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [addImageData, setAddImageData] = useState(null);
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

  const objectsList = usePagedList(
    ({ size, page }) => getUserObjectsPage(groupId, { size, page }),
    {
      resetKey: `group-objects:${groupId}`,
      enabled: !searchActive,
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
      reservedFirstPageSlots: 1,
    },
  );

  const objectsSearch = usePagedList(
    ({ size, page }) =>
      searchGroupObjectsPage(groupId, searchKeyword, { size, page }),
    {
      resetKey: `group-objects-search:${groupId}:${searchKeyword}`,
      enabled: searchActive && Boolean(searchKeyword),
      pageSize: PAGE_SIZE,
      pageParamKey: "page",
    },
  );

  const activePage = searchActive ? objectsSearch : objectsList;
  const displayObjects = activePage.items;
  const showAddCard = !searchActive && activePage.page === 0;
  const listData = showAddCard
    ? [{ id: "__add__" }, ...displayObjects]
    : displayObjects;

  useEffect(() => {
    if (!group) {
      getGroupById(groupId)
        .then(setGroup)
        .catch((err) => message.error(err?.message || t("failedToLoadGroups")));
    }
  }, [groupId, group, message, t]);

  useEffect(() => {
    const keyword = (searchValue ?? "").trim();
    if (keyword) {
      syncedKeywordRef.current = keyword;
      setDraftQuery(keyword);
      setSearchKeyword(keyword);
      setSearchActive(true);
    } else {
      syncedKeywordRef.current = "";
      setSearchKeyword("");
      setSearchActive(false);
    }
  }, [groupId, searchValue]);

  const runSearch = useCallback(
    (keyword) => {
      const trimmed = keyword.trim();
      if (!trimmed) {
        setSearchParam("");
        syncedKeywordRef.current = "";
        setSearchKeyword("");
        setSearchActive(false);
        return;
      }
      setSearchParam(trimmed);
      syncedKeywordRef.current = trimmed;
      setSearchKeyword(trimmed);
      setSearchActive(true);
    },
    [setSearchParam],
  );

  const handleDeleteGroup = () => {
    if (!group) return;
    modal.confirm({
      title: t("deleteGroupTitle"),
      content: t("deleteGroupContent").replace("{name}", group.name),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          await deleteGroup(group.id);
          message.success(t("groupDeleted"));
          navigate("/groups");
        } catch (err) {
          message.error(err?.message || t("failedToDeleteGroup"));
        }
      },
    });
  };

  const openEditGroup = () => {
    if (!group) return;
    editGroupForm.setFieldsValue({ name: group.name });
    setEditGroupImageData(null);
    setEditGroupVisible(true);
  };

  useLayoutEffect(() => {
    scrollAppToTop();
  }, [groupId]);

  useLayoutEffect(() => {
    setHeaderSlot(
      <GroupObjectsPageHeader
        group={group}
        returnSearch={returnSearchRef.current}
        onEdit={openEditGroup}
        onDelete={handleDeleteGroup}
      />,
    );
    return () => setHeaderSlot(null);
  }, [group]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateGroup = async () => {
    if (!group) return;
    try {
      const values = await editGroupForm.validateFields();
      setEditGroupLoading(true);
      const image_url = editGroupImageData ?? group.image_url;
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
      const image_url =
        addImageData ?? selectedBrandObjectForAdd?.image_url ?? null;
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
        objectsList.loadPage(0);
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
    setAddImageData(null);
    setAddSearchResults([]);
    setSelectedBrandObjectForAdd(null);
    setAddVisible(true);
  };

  return (
    <div>
      <Spin spinning={activePage.loading && displayObjects.length === 0}>
        <ObjectListPageLayout
          summary={
            <SearchResultsSummary
              active={searchActive}
              keyword={searchKeyword}
              count={activePage.totalElements}
              exact={activePage.totalExact}
              loading={searchActive && activePage.loading}
            />
          }
          search={
            <Search
              id="group-objects-search"
              name="groupObjectsSearch"
              placeholder={t("searchModels")}
              allowClear
              value={draftQuery}
              onChange={(e) => {
                const v = e.target.value;
                setDraftQuery(v);
                if (v === "") runSearch("");
              }}
              onSearch={runSearch}
            />
          }
        >
          {searchActive &&
          displayObjects.length === 0 &&
          !activePage.loading ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--neu-text-2)",
                padding: "32px 0",
              }}
            >
              {t("noSearchResults")}
            </div>
          ) : (
            <>
              <div className="neu-list-page-browse-grid">
                {listData.map((item) =>
                  item.id === "__add__" ? (
                    <NeuCard
                      key="__add__"
                      add
                      name={t("addModel")}
                      onClick={openAddUserObject}
                    />
                  ) : (
                    <NeuCard
                      key={item.id}
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
                  ),
                )}
              </div>
              <ListPagination
                page={activePage.page}
                totalPages={activePage.totalPages}
                loading={activePage.loading}
                onPageChange={activePage.onPageChange}
                pageSize={PAGE_SIZE}
              />
            </>
          )}
        </ObjectListPageLayout>
      </Spin>

      <EditGroupModal
        visible={editGroupVisible}
        onOk={handleUpdateGroup}
        onCancel={() => {
          if (editGroupImageData)
            discardUploadedImage(editGroupImageData).catch(() => {});
          setEditGroupImageData(null);
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
          setAddImageData(null);
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
