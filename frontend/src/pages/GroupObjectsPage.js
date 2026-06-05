import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useSearchParam from "../hooks/useSearchParam";
import { App, Button, Card, Form, Grid, Spin } from "antd";
import { NeuInput } from "../components/NeuFormControl";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import AddCardCover from "../components/ObjectList/AddCardCover";
import CardCover from "../components/ObjectList/CardCover";
import AddUserObjectInGroupModal from "../components/ObjectList/modals/AddUserObjectInGroupModal";
import EditGroupModal from "../components/ObjectList/modals/EditGroupModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getGroupById,
  getUserObjects,
  searchGroupObjects,
  updateGroup,
  deleteGroup,
  createUserObject,
  searchBrandObjects,
  purchasePriceFromFormValue,
} from "../utils";

const { Search } = NeuInput;
const { useBreakpoint } = Grid;

const normalizeList = (data) =>
  Array.isArray(data) ? data : data?.content != null ? data.content : [];

export default function GroupObjectsPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;

  const [searchValue, setSearchParam] = useSearchParam();
  const [group, setGroup] = useState(location.state?.group ?? null);
  const [userObjects, setUserObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [draftQuery, setDraftQuery] = useState(searchValue);

  // Edit group modal
  const [editGroupVisible, setEditGroupVisible] = useState(false);
  const [editGroupLoading, setEditGroupLoading] = useState(false);
  const [editGroupForm] = Form.useForm();
  const [editGroupImageData, setEditGroupImageData] = useState(null);

  // Add user object modal
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [addImageData, setAddImageData] = useState(null);
  const [addSearchResults, setAddSearchResults] = useState([]);
  const [addSearchLoading, setAddSearchLoading] = useState(false);
  const [selectedBrandObjectForAdd, setSelectedBrandObjectForAdd] =
    useState(null);

  const fetchUserObjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserObjects(groupId);
      setUserObjects(normalizeList(data));
    } catch (err) {
      message.error(err?.message || t("failedToLoadGroupModels"));
    } finally {
      setLoading(false);
    }
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = useCallback(
    async (keyword) => {
      setLoading(true);
      try {
        const data = await searchGroupObjects(groupId, keyword);
        setSearchResults(Array.isArray(data) ? data : []);
        setSearchActive(true);
      } catch (err) {
        message.error(err?.message || t("failedToSearchBrands"));
      } finally {
        setLoading(false);
      }
    },
    [groupId],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!group) {
      getGroupById(groupId)
        .then(setGroup)
        .catch((err) => message.error(err?.message || t("failedToLoadGroups")));
    }
    fetchUserObjects();
    if (searchValue) doSearch(searchValue);
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    setHeaderSlot(
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          width: "100%",
          gap: 8,
        }}
      >
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/groups")}
          />
        </div>
        <span className="header-slot-title">
          {group?.name ?? "…"}
        </span>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button icon={<EditOutlined />} onClick={openEditGroup} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteGroup}
          />
        </div>
      </div>,
    );
    return () => setHeaderSlot(null);
  }, [group]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayObjects = searchActive ? searchResults : userObjects;

  const openEditGroup = () => {
    if (!group) return;
    editGroupForm.setFieldsValue({ name: group.name });
    setEditGroupImageData(null);
    setEditGroupVisible(true);
  };

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
        const created = await createUserObject(group.id, payload);
        message.success(t("modelAdded"));
        setUserObjects((prev) => [
          ...prev,
          {
            ...created,
            purchasePrice: created.purchasePrice ?? created.purchase_price,
            purchaseDate: created.purchaseDate ?? created.purchase_date,
            otherNotes: created.otherNotes ?? created.other_notes,
            brandObjectId: created.brandObjectId ?? created.brand_object_id,
          },
        ]);
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

  const handleAddSearch = async (value) => {
    const keyword = (value || "").trim();
    if (keyword === "") {
      setAddSearchResults([]);
      return;
    }
    setAddSearchLoading(true);
    try {
      const data = await searchBrandObjects(keyword);
      setAddSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("searchFailed"));
      setAddSearchResults([]);
    } finally {
      setAddSearchLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder={t("searchModels")}
          allowClear
          value={draftQuery}
          onChange={(e) => {
            const v = e.target.value;
            setDraftQuery(v);
            if (v === "") {
              setSearchActive(false);
              setSearchResults([]);
              setSearchParam("");
            }
          }}
          onSearch={(v) => {
            const keyword = (v ?? "").trim();
            if (keyword) {
              setSearchParam(keyword);
              doSearch(keyword);
            } else {
              setSearchActive(false);
              setSearchResults([]);
              setSearchParam("");
            }
          }}
          style={{ width: screens.md ? 260 : "100%" }}
        />
      </div>

      <Spin spinning={loading}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16,
          }}
        >
          {[{ id: "__add__" }, ...displayObjects].map((item) =>
            item.id === "__add__" ? (
              <Card
                key="__add__"
                hoverable
                className="neu-card"
                cover={<AddCardCover label={t("addModel")} />}
                onClick={openAddUserObject}
                bodyStyle={{ padding: 0 }}
              />
            ) : (
              <Card
                key={item.id}
                hoverable
                className="neu-card"
                cover={
                  <CardCover
                    image_url={item.image_url}
                    name={item.name ?? "—"}
                  />
                }
                onClick={() =>
                  navigate(`/groups/${groupId}/objects/${item.id}`, {
                    state: { userObject: item, group },
                  })
                }
                bodyStyle={{ padding: 0 }}
              />
            ),
          )}
        </div>
      </Spin>

      <EditGroupModal
        visible={editGroupVisible}
        onOk={handleUpdateGroup}
        onCancel={() => setEditGroupVisible(false)}
        confirmLoading={editGroupLoading}
        form={editGroupForm}
        selectedGroup={group}
        imageData={editGroupImageData}
        onImageChange={setEditGroupImageData}
      />

      <AddUserObjectInGroupModal
        visible={addVisible}
        onOk={handleAddUserObject}
        onCancel={() => setAddVisible(false)}
        confirmLoading={addLoading}
        form={addForm}
        searchResults={addSearchResults}
        searchLoading={addSearchLoading}
        onSearch={handleAddSearch}
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
