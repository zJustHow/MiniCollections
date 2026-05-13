import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { App, Button, Card, Form, Grid, Input, Spin } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CardCover from "../components/ObjectList/CardCover";
import AddUserObjectInGroupModal from "../components/ObjectList/modals/AddUserObjectInGroupModal";
import EditGroupModal from "../components/ObjectList/modals/EditGroupModal";
import EditUserObjectModal from "../components/ObjectList/modals/EditUserObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getGroupById,
  getUserObjects,
  getBrandObjectById,
  updateGroup,
  deleteGroup,
  createUserObject,
  updateUserObject,
  deleteUserObject,
  searchBrandObjects,
  purchasePriceFromFormValue,
  displayPurchasePriceFromObject,
} from "../utils";

const { Search } = Input;
const { useBreakpoint } = Grid;

const normalizeList = (data) =>
  Array.isArray(data) ? data : data?.content != null ? data.content : [];

function DetailRow({ label, value }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(184,182,176,0.2)",
      }}
    >
      <span style={{ color: "var(--neu-text-2)", fontSize: 13, minWidth: 110, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color: "var(--neu-text)", fontSize: 13, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

export default function GroupObjectsPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;

  const [group, setGroup] = useState(location.state?.group ?? null);
  const [userObjects, setUserObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [draftQuery, setDraftQuery] = useState("");

  // Detail view state (two nested levels)
  const [detailUserObject, setDetailUserObject] = useState(null);
  const [showBrandDetail, setShowBrandDetail] = useState(false);
  const [userObjectBrandDetail, setUserObjectBrandDetail] = useState(null);
  const [loadingBrandDetail, setLoadingBrandDetail] = useState(false);

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
  const [selectedBrandObjectForAdd, setSelectedBrandObjectForAdd] = useState(null);

  // Edit user object modal
  const [editUserObjectVisible, setEditUserObjectVisible] = useState(false);
  const [editUserObjectLoading, setEditUserObjectLoading] = useState(false);
  const [editUserObjectForm] = Form.useForm();
  const [editUserObjectImageData, setEditUserObjectImageData] = useState(null);
  const [editModelSearchResults, setEditModelSearchResults] = useState([]);
  const [editModelSearchLoading, setEditModelSearchLoading] = useState(false);

  const fetchUserObjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserObjects(groupId);
      setUserObjects(normalizeList(data));
    } catch (err) {
      message.error(err.message || t("failedToLoadGroupModels"));
    } finally {
      setLoading(false);
    }
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!group) {
      getGroupById(groupId)
        .then(setGroup)
        .catch((err) => message.error(err.message || t("failedToLoadGroups")));
    }
    fetchUserObjects();
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset brand detail level when user object changes
  useEffect(() => {
    setShowBrandDetail(false);
  }, [detailUserObject]);

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
          message.error(err.message || t("failedToDeleteGroup"));
        }
      },
    });
  };

  const handleDeleteUserObject = () => {
    if (!detailUserObject || !group) return;
    const userObjectId = detailUserObject.id;
    const itemName = detailUserObject.name ?? "—";
    modal.confirm({
      title: t("deleteModelTitle"),
      content: t("deleteModelContent").replace("{name}", itemName),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          await deleteUserObject(group.id, userObjectId);
          setDetailUserObject(null);
          setUserObjects((prev) => prev.filter((o) => o.id !== userObjectId));
          message.success(t("modelDeleted"));
        } catch (err) {
          message.error(err.message || t("failedToDeleteModel"));
        }
      },
    });
  };

  // Inject back/title/controls into the top bar
  useEffect(() => {
    if (showBrandDetail && userObjectBrandDetail) {
      setHeaderSlot(
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%", gap: 8 }}>
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setShowBrandDetail(false)} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
            {userObjectBrandDetail.name ?? t("brandModelLabel")}
          </span>
          <div />
        </div>
      );
    } else if (detailUserObject) {
      setHeaderSlot(
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%", gap: 8 }}>
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setDetailUserObject(null)} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
            {detailUserObject.name ?? "—"}
          </span>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button icon={<EditOutlined />} onClick={openEditUserObject} />
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteUserObject} />
          </div>
        </div>
      );
    } else {
      setHeaderSlot(
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%", gap: 8 }}>
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/groups")} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
            {group?.name ?? "…"}
          </span>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button icon={<EditOutlined />} onClick={openEditGroup} />
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteGroup} />
          </div>
        </div>
      );
    }
    return () => setHeaderSlot(null);
  }, [group, detailUserObject, showBrandDetail, userObjectBrandDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredObjects = searchKeyword.trim()
    ? userObjects.filter((item) =>
        (item.name ?? "").toLowerCase().includes(searchKeyword.trim().toLowerCase())
      )
    : userObjects;

  const handleUserObjectClick = async (userObject) => {
    setDetailUserObject(userObject);
    const brandObjectId = userObject.brandObjectId ?? userObject.brand_object_id;
    if (brandObjectId) {
      setLoadingBrandDetail(true);
      try {
        const data = await getBrandObjectById(brandObjectId);
        setUserObjectBrandDetail(data);
      } catch (err) {
        message.error(err.message || t("failedToLoadBrandObjectDetail"));
      } finally {
        setLoadingBrandDetail(false);
      }
    } else {
      setUserObjectBrandDetail(null);
    }
  };

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
        const data = await updateGroup(group.id, { name: values.name, image_url: image_url || null });
        message.success(t("groupUpdated"));
        setGroup((prev) => ({ ...prev, name: data.name, image_url: data.image_url }));
        setEditGroupVisible(false);
      } catch (err) {
        message.error(err.message || t("failedToUpdateGroup"));
      } finally {
        setEditGroupLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  const openEditUserObject = () => {
    if (!detailUserObject) return;
    const pd = detailUserObject.purchaseDate ?? detailUserObject.purchase_date;
    const brandObjectId = detailUserObject.brandObjectId ?? detailUserObject.brand_object_id;
    editUserObjectForm.setFieldsValue({
      brandObjectId: brandObjectId ?? undefined,
      name: detailUserObject.name ?? "",
      purchasePrice: displayPurchasePriceFromObject(detailUserObject),
      purchaseDate: pd ? dayjs(pd) : null,
      otherNotes: detailUserObject.otherNotes ?? detailUserObject.other_notes ?? "",
    });
    setEditUserObjectImageData(null);
    setEditModelSearchResults(userObjectBrandDetail ? [userObjectBrandDetail] : []);
    setEditUserObjectVisible(true);
  };

  const handleUpdateUserObject = async () => {
    if (!detailUserObject || !group) return;
    try {
      const values = await editUserObjectForm.validateFields();
      setEditUserObjectLoading(true);
      const selectedBo =
        (values.brandObjectId != null &&
          values.brandObjectId !== "" &&
          editModelSearchResults.find(
            (o) => Number(o.id) === Number(values.brandObjectId)
          )) ||
        null;
      const image_url =
        editUserObjectImageData ?? detailUserObject.image_url ?? selectedBo?.image_url;
      const payload = {
        brand_object_id:
          values.brandObjectId != null && values.brandObjectId !== ""
            ? Number(values.brandObjectId)
            : null,
        name: values.name,
        image_url: image_url || null,
        purchase_date: values.purchaseDate ? values.purchaseDate.format("YYYY-MM-DD") : null,
        ...purchasePriceFromFormValue(values.purchasePrice),
        other_notes: values.otherNotes || null,
      };
      try {
        const data = await updateUserObject(group.id, detailUserObject.id, payload);
        message.success(t("modelUpdated"));
        const updated = {
          ...data,
          purchasePrice: data.purchasePrice ?? data.purchase_price,
          purchaseDate: data.purchaseDate ?? data.purchase_date,
          otherNotes: data.otherNotes ?? data.other_notes,
          brandObjectId: data.brandObjectId ?? data.brand_object_id,
        };
        setDetailUserObject(updated);
        setUserObjects((prev) => prev.map((o) => (o.id === detailUserObject.id ? updated : o)));
        const newBrandObjectId = updated.brandObjectId ?? updated.brand_object_id;
        if (newBrandObjectId == null) {
          setUserObjectBrandDetail(null);
        } else if (selectedBo && Number(selectedBo.id) === Number(newBrandObjectId)) {
          setUserObjectBrandDetail({ ...selectedBo });
        } else {
          try {
            const brandData = await getBrandObjectById(newBrandObjectId);
            setUserObjectBrandDetail(brandData);
          } catch {
            setUserObjectBrandDetail(null);
          }
        }
        setEditUserObjectVisible(false);
      } catch (err) {
        message.error(err.message || t("failedToUpdateModel"));
      } finally {
        setEditUserObjectLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  const handleAddUserObject = async () => {
    if (!group) return;
    try {
      const values = await addForm.validateFields();
      const image_url = addImageData ?? selectedBrandObjectForAdd?.image_url ?? null;
      const payload = {
        brand_object_id: values.brandObjectId ?? null,
        name: values.name,
        image_url: image_url || null,
        purchase_date: values.purchaseDate ? values.purchaseDate.format("YYYY-MM-DD") : null,
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
        message.error(err.message || t("failedToAddModel"));
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
    if (keyword === "") { setAddSearchResults([]); return; }
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

  const handleEditSearch = async (value) => {
    const keyword = (value || "").trim();
    if (keyword === "") {
      setEditModelSearchResults(userObjectBrandDetail ? [userObjectBrandDetail] : []);
      return;
    }
    setEditModelSearchLoading(true);
    try {
      const data = await searchBrandObjects(keyword);
      setEditModelSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("searchFailed"));
      setEditModelSearchResults([]);
    } finally {
      setEditModelSearchLoading(false);
    }
  };

  const purchasePrice = detailUserObject
    ? (detailUserObject.purchasePrice ?? detailUserObject.purchase_price)
    : null;
  const purchaseDate = detailUserObject
    ? (detailUserObject.purchaseDate ?? detailUserObject.purchase_date)
    : null;
  const otherNotes = detailUserObject
    ? (detailUserObject.otherNotes ?? detailUserObject.other_notes)
    : null;

  return (
    <div>
      {/* Brand detail (3rd level) */}
      {showBrandDetail && userObjectBrandDetail && (
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: screens.md ? "nowrap" : "wrap" }}>
          <div style={{ flex: screens.md ? "0 0 45%" : "1 1 100%", maxWidth: screens.md ? "45%" : "100%" }}>
            {userObjectBrandDetail.image_url ? (
              <img
                src={userObjectBrandDetail.image_url}
                alt={userObjectBrandDetail.name}
                loading="lazy"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 16, boxShadow: "var(--raised-sm)", display: "block" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 16, boxShadow: "var(--raised-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PictureOutlined style={{ fontSize: 48, color: "var(--neu-text-2)" }} />
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DetailRow label={t("category")} value={userObjectBrandDetail.category} />
            <DetailRow label={t("scale")} value={userObjectBrandDetail.scale} />
            <DetailRow label={t("releasePrice")} value={userObjectBrandDetail.release_price ?? userObjectBrandDetail.releasePrice} />
            <DetailRow label={t("releaseDate")} value={userObjectBrandDetail.release_date ?? userObjectBrandDetail.releaseDate} />
          </div>
        </div>
      )}

      {/* User object detail (2nd level) */}
      {detailUserObject && !showBrandDetail && (
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: screens.md ? "nowrap" : "wrap" }}>
          {/* Image */}
          <div style={{ flex: screens.md ? "0 0 45%" : "1 1 100%", maxWidth: screens.md ? "45%" : "100%" }}>
            {detailUserObject.image_url ? (
              <img
                src={detailUserObject.image_url}
                alt={detailUserObject.name ?? ""}
                loading="lazy"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 16, boxShadow: "var(--raised-sm)", display: "block" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 16, boxShadow: "var(--raised-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PictureOutlined style={{ fontSize: 48, color: "var(--neu-text-2)" }} />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <DetailRow label={t("purchasePrice")} value={purchasePrice != null ? purchasePrice : null} />
            <DetailRow label={t("purchaseDate")} value={purchaseDate} />
            <DetailRow label={t("notes")} value={otherNotes} />

            <div style={{ marginTop: 16 }}>
              <div style={{ color: "var(--neu-text-2)", fontSize: 13, marginBottom: 8 }}>
                {t("brandModelLabel")}
              </div>
              <Spin spinning={loadingBrandDetail}>
                {userObjectBrandDetail ? (
                  <button
                    type="button"
                    onClick={() => setShowBrandDetail(true)}
                    className="neu-clickable"
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10 }}
                  >
                    {userObjectBrandDetail.image_url ? (
                      <img src={userObjectBrandDetail.image_url} alt={userObjectBrandDetail.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PictureOutlined style={{ fontSize: 20, color: "var(--neu-text-2)" }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neu-text)" }}>{userObjectBrandDetail.name}</div>
                      {(userObjectBrandDetail.category || userObjectBrandDetail.scale) && (
                        <div style={{ fontSize: 12, color: "var(--neu-text-2)", marginTop: 2 }}>
                          {[userObjectBrandDetail.category, userObjectBrandDetail.scale].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                  </button>
                ) : (
                  <div style={{ color: "var(--neu-text-2)", fontSize: 13 }}>
                    {t("noRelatedBrandModel")}
                  </div>
                )}
              </Spin>
            </div>
          </div>
        </div>
      )}

      {/* List view (1st level) */}
      {!detailUserObject && (
        <>
          {/* Search bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Search
              placeholder={t("searchModels")}
              allowClear
              value={draftQuery}
              onChange={(e) => {
                const v = e.target.value;
                setDraftQuery(v);
                if (v === "") setSearchKeyword("");
              }}
              onSearch={(v) => setSearchKeyword((v ?? "").trim())}
              style={{ width: screens.md ? 200 : "100%" }}
            />
          </div>

          <Spin spinning={loading}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
              {[{ id: "__add__" }, ...filteredObjects].map((item) =>
                item.id === "__add__" ? (
                  <Card
                    key="__add__"
                    hoverable
                    className="neu-model-card"
                    cover={
                      <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden", borderRadius: "32px 32px 0 0" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <PlusOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
                        </div>
                        <div className="neu-nameplate">{t("addModel")}</div>
                      </div>
                    }
                    onClick={openAddUserObject}
                    bodyStyle={{ padding: 0 }}
                  />
                ) : (
                  <Card
                    key={item.id}
                    hoverable
                    className="neu-model-card"
                    cover={<CardCover image_url={item.image_url} name={item.name ?? "—"} />}
                    onClick={() => handleUserObjectClick(item)}
                    bodyStyle={{ padding: 0 }}
                  />
                )
              )}
            </div>
          </Spin>
        </>
      )}

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
          if (value == null) { setSelectedBrandObjectForAdd(null); return; }
          const bo = addSearchResults.find((o) => o.id === value);
          setSelectedBrandObjectForAdd(bo ?? null);
          if (bo) addForm.setFieldsValue({ name: bo.name ?? "" });
        }}
        imageData={addImageData}
        onImageChange={setAddImageData}
      />

      <EditUserObjectModal
        visible={editUserObjectVisible}
        onOk={handleUpdateUserObject}
        onCancel={() => setEditUserObjectVisible(false)}
        confirmLoading={editUserObjectLoading}
        form={editUserObjectForm}
        searchResults={editModelSearchResults}
        searchLoading={editModelSearchLoading}
        onSearch={handleEditSearch}
        imageData={editUserObjectImageData}
        selectedUserObject={detailUserObject}
        onImageChange={setEditUserObjectImageData}
      />
    </div>
  );
}
