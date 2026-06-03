import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { App, Button, Form, Grid, Spin } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DetailImage from "../components/DetailImage";
import RelatedModelCard from "../components/RelatedModelCard";
import EditUserObjectModal from "../components/ObjectList/modals/EditUserObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getGroupById,
  getUserObjects,
  getBrandObjectById,
  updateUserObject,
  deleteUserObject,
  searchBrandObjects,
  purchasePriceFromFormValue,
  displayPurchasePriceFromObject,
} from "../utils";

const { useBreakpoint } = Grid;

function DetailRow({ label, value }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}>
      <span style={{ color: "var(--neu-text-2)", fontSize: 13, minWidth: 100, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--neu-text)", fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function GroupObjectDetailPage() {
  const { groupId, objectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const screens = useBreakpoint();

  const [userObject, setUserObject] = useState(location.state?.userObject ?? null);
  const [group, setGroup] = useState(location.state?.group ?? null);
  const [brandObjectDetail, setBrandObjectDetail] = useState(null);
  const [loadingBrandDetail, setLoadingBrandDetail] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editImageData, setEditImageData] = useState(null);
  const [editSearchResults, setEditSearchResults] = useState([]);
  const [editSearchLoading, setEditSearchLoading] = useState(false);

  const fetchUserObject = useCallback(async () => {
    try {
      const data = await getUserObjects(groupId);
      const list = Array.isArray(data) ? data : data?.content ?? [];
      const found = list.find((o) => String(o.id) === String(objectId));
      if (found) setUserObject(found);
    } catch (err) {
      message.error(err?.message || t("failedToLoadGroupModels"));
    }
  }, [groupId, objectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!group) {
      getGroupById(groupId)
        .then(setGroup)
        .catch((err) => message.error(err?.message || t("failedToLoadGroups")));
    }
    if (!userObject) fetchUserObject();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userObject) return;
    const brandObjectId = userObject.brandObjectId ?? userObject.brand_object_id;
    if (!brandObjectId) { setBrandObjectDetail(null); return; }
    setLoadingBrandDetail(true);
    getBrandObjectById(brandObjectId)
      .then(setBrandObjectDetail)
      .catch(() => setBrandObjectDetail(null))
      .finally(() => setLoadingBrandDetail(false));
  }, [userObject]);

  const handleDelete = () => {
    if (!userObject) return;
    modal.confirm({
      title: t("deleteModelTitle"),
      content: t("deleteModelContent").replace("{name}", userObject.name ?? "—"),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          await deleteUserObject(groupId, userObject.id);
          message.success(t("modelDeleted"));
          navigate(`/groups/${groupId}`, { replace: true });
        } catch (err) {
          message.error(err?.message || t("failedToDeleteModel"));
        }
      },
    });
  };

  const openEdit = () => {
    if (!userObject) return;
    const pd = userObject.purchaseDate ?? userObject.purchase_date;
    const brandObjectId = userObject.brandObjectId ?? userObject.brand_object_id;
    editForm.setFieldsValue({
      brandObjectId: brandObjectId ?? undefined,
      name: userObject.name ?? "",
      purchasePrice: displayPurchasePriceFromObject(userObject),
      purchaseDate: pd ? dayjs(pd) : null,
      otherNotes: userObject.otherNotes ?? userObject.other_notes ?? "",
    });
    setEditImageData(null);
    setEditSearchResults(brandObjectDetail ? [brandObjectDetail] : []);
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!userObject) return;
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      const selectedBo =
        (values.brandObjectId != null &&
          values.brandObjectId !== "" &&
          editSearchResults.find((o) => Number(o.id) === Number(values.brandObjectId))) ||
        null;
      const image_url = editImageData ?? userObject.image_url ?? selectedBo?.image_url;
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
        const data = await updateUserObject(groupId, userObject.id, payload);
        message.success(t("modelUpdated"));
        const updated = {
          ...data,
          purchasePrice: data.purchasePrice ?? data.purchase_price,
          purchaseDate: data.purchaseDate ?? data.purchase_date,
          otherNotes: data.otherNotes ?? data.other_notes,
          brandObjectId: data.brandObjectId ?? data.brand_object_id,
        };
        setUserObject(updated);
        const newBrandObjectId = updated.brandObjectId ?? updated.brand_object_id;
        if (newBrandObjectId == null) {
          setBrandObjectDetail(null);
        } else if (selectedBo && Number(selectedBo.id) === Number(newBrandObjectId)) {
          setBrandObjectDetail({ ...selectedBo });
        } else {
          getBrandObjectById(newBrandObjectId)
            .then(setBrandObjectDetail)
            .catch(() => setBrandObjectDetail(null));
        }
        setEditVisible(false);
      } catch (err) {
        message.error(err?.message || t("failedToUpdateModel"));
      } finally {
        setEditLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  const handleEditSearch = async (value) => {
    const keyword = (value || "").trim();
    if (keyword === "") {
      setEditSearchResults(brandObjectDetail ? [brandObjectDetail] : []);
      return;
    }
    setEditSearchLoading(true);
    try {
      const data = await searchBrandObjects(keyword);
      setEditSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.message || t("searchFailed"));
      setEditSearchResults([]);
    } finally {
      setEditSearchLoading(false);
    }
  };

  useEffect(() => {
    setHeaderSlot(
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%", gap: 8 }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
          {userObject?.name ?? "…"}
        </span>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {userObject && (
            <>
              <Button icon={<EditOutlined />} onClick={openEdit} />
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete} />
            </>
          )}
        </div>
      </div>
    );
    return () => setHeaderSlot(null);
  }, [userObject]); // eslint-disable-line react-hooks/exhaustive-deps

  const purchasePrice = userObject ? (userObject.purchasePrice ?? userObject.purchase_price) : null;
  const purchaseDate = userObject ? (userObject.purchaseDate ?? userObject.purchase_date) : null;
  const otherNotes = userObject ? (userObject.otherNotes ?? userObject.other_notes) : null;
  const imageUrl = userObject?.imageUrl ?? userObject?.image_url ?? null;

  return (
    <div>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: screens.md ? "nowrap" : "wrap" }}>
        <div style={{ flex: screens.md ? "0 0 45%" : "1 1 100%", maxWidth: screens.md ? "45%" : "100%" }}>
          <DetailImage imageUrl={imageUrl} alt={userObject?.name ?? ""} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <DetailRow label={t("purchasePrice")} value={purchasePrice} />
          <DetailRow label={t("purchaseDate")} value={purchaseDate} />
          <DetailRow label={t("notes")} value={otherNotes} />

          <div style={{ marginTop: 16 }}>
            <div style={{ color: "var(--neu-text-2)", fontSize: 13, marginBottom: 8 }}>{t("brandModelLabel")}</div>
            <Spin spinning={loadingBrandDetail}>
              {brandObjectDetail ? (
                <RelatedModelCard
                  brandObject={brandObjectDetail}
                  onClick={() => {
                    const bId =
                      brandObjectDetail.brand_id ?? brandObjectDetail.brandId;
                    navigate(`/brands/${bId}/objects/${brandObjectDetail.id}`, {
                      state: { brandObject: brandObjectDetail },
                    });
                  }}
                />
              ) : (
                !loadingBrandDetail && (
                  <div style={{ color: "var(--neu-text-2)", fontSize: 13 }}>{t("noRelatedBrandModel")}</div>
                )
              )}
            </Spin>
          </div>
        </div>
      </div>

      <EditUserObjectModal
        visible={editVisible}
        onOk={handleUpdate}
        onCancel={() => setEditVisible(false)}
        confirmLoading={editLoading}
        form={editForm}
        searchResults={editSearchResults}
        searchLoading={editSearchLoading}
        onSearch={handleEditSearch}
        imageData={editImageData}
        selectedUserObject={userObject}
        onImageChange={setEditImageData}
      />
    </div>
  );
}
