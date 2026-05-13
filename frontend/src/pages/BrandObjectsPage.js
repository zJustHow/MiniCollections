import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { App, Button, Card, Form, Grid, Input, Popconfirm, Spin } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined } from "@ant-design/icons";
import CardCover from "../components/ObjectList/CardCover";
import AddToGroupModal from "../components/ObjectList/modals/AddToGroupModal";
import SubmitObjectModal from "../components/ObjectList/modals/SubmitObjectModal";
import BrandModal from "../components/ObjectList/modals/BrandModal";
import BrandObjectModal from "../components/ObjectList/modals/BrandObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getBrandByBrandId,
  getBrandObjectsByBrandId,
  getGroups,
  createUserObject,
  adminDeleteBrand,
  adminDeleteBrandObject,
  purchasePriceFromFormValue,
} from "../utils";

const { Search } = Input;
const { useBreakpoint } = Grid;

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}>
      <span style={{ color: "var(--neu-text-2)", fontSize: 13, minWidth: 100, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color: "var(--neu-text)", fontSize: 13, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

export default function BrandObjectsPage({ isAdmin }) {
  const { brandId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const screens = useBreakpoint();
  const cols = screens.lg ? 4 : screens.md ? 3 : 2;

  const [brand, setBrand] = useState(location.state?.brand ?? null);
  const [brandObjects, setBrandObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  // AddToGroup modal
  const [groups, setGroups] = useState([]);
  const [addToGroupVisible, setAddToGroupVisible] = useState(false);
  const [addToGroupLoading, setAddToGroupLoading] = useState(false);
  const [selectedBrandObject, setSelectedBrandObject] = useState(null);
  const [addToGroupForm] = Form.useForm();
  const [customImageData, setCustomImageData] = useState(null);

  // Submit modal
  const [submitModalVisible, setSubmitModalVisible] = useState(false);

  // Admin brand modal
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Admin brand object modal
  const [brandObjectModalOpen, setBrandObjectModalOpen] = useState(false);
  const [editingBrandObject, setEditingBrandObject] = useState(null);

  const fetchBrandObjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBrandObjectsByBrandId(brandId);
      setBrandObjects(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err.message || t("failedToLoadModels"));
    } finally {
      setLoading(false);
    }
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!brand) {
      getBrandByBrandId(brandId)
        .then(setBrand)
        .catch((err) => message.error(err.message || t("failedToLoadBrands")));
    }
    fetchBrandObjects();
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync detailItem when brandObjects refresh
  useEffect(() => {
    if (!detailItem) return;
    const updated = brandObjects.find((o) => o.id === detailItem.id);
    setDetailItem(updated ?? null);
  }, [brandObjects]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdminDeleteBrand = async () => {
    if (!brand) return;
    try {
      await adminDeleteBrand(brand.id);
      message.success(t("brandDeleted"));
      navigate("/");
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrand"));
    }
  };

  const handleAdminDeleteBrandObject = async (obj) => {
    try {
      await adminDeleteBrandObject(obj.id);
      message.success(t("brandObjectDeleted"));
      await fetchBrandObjects();
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrandObject"));
    }
  };

  // Inject back/title/controls into the top bar
  useEffect(() => {
    if (detailItem) {
      setHeaderSlot(
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%", gap: 8 }}>
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setDetailItem(null)} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
            {detailItem.name}
          </span>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {isAdmin && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => { setEditingBrandObject(detailItem); setBrandObjectModalOpen(true); }}
                />
                <Popconfirm
                  title={t("deleteBrandObjectTitle")}
                  description={t("deleteBrandObjectContent").replace("{name}", detailItem.name)}
                  onConfirm={() => handleAdminDeleteBrandObject(detailItem)}
                  okText={t("delete")}
                  okButtonProps={{ danger: true }}
                  cancelText={t("cancel")}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </>
            )}
          </div>
        </div>
      );
    } else {
      setHeaderSlot(
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", width: "100%", gap: 8 }}>
          <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
            {brand?.name ?? "…"}
          </span>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {isAdmin && brand && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => { setEditingBrand(brand); setBrandModalOpen(true); }}
                />
                <Popconfirm
                  title={t("deleteBrandTitle")}
                  description={t("deleteBrandContent").replace("{name}", brand.name)}
                  onConfirm={handleAdminDeleteBrand}
                  okText={t("delete")}
                  okButtonProps={{ danger: true }}
                  cancelText={t("cancel")}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </>
            )}
          </div>
        </div>
      );
    }
    return () => setHeaderSlot(null);
  }, [brand, detailItem, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredObjects = searchKeyword.trim()
    ? brandObjects.filter((bo) => {
        const kw = searchKeyword.trim().toLowerCase();
        return (
          (bo.name || "").toLowerCase().includes(kw) ||
          (bo.name_en || "").toLowerCase().includes(kw) ||
          (bo.name_zh || "").toLowerCase().includes(kw)
        );
      })
    : brandObjects;

  const listData = isAdmin ? [{ id: "__add__" }, ...filteredObjects] : filteredObjects;

  const openAddToGroup = async (brandObject) => {
    setSelectedBrandObject(brandObject);
    setCustomImageData(null);
    addToGroupForm.setFieldsValue({
      name: brandObject.name,
      purchasePrice: undefined,
      purchaseDate: null,
      otherNotes: "",
      groupId: undefined,
    });
    try {
      const data = await getGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err.message || t("failedToLoadGroups"));
    }
    setAddToGroupVisible(true);
  };

  const handleCreateUserObject = async () => {
    try {
      const values = await addToGroupForm.validateFields();
      if (!selectedBrandObject) return;
      const payload = {
        brand_object_id: selectedBrandObject.id,
        name: values.name,
        image_url: customImageData || selectedBrandObject.image_url,
        purchase_date: values.purchaseDate ? values.purchaseDate.format("YYYY-MM-DD") : null,
        ...purchasePriceFromFormValue(values.purchasePrice),
        other_notes: values.otherNotes || null,
      };
      setAddToGroupLoading(true);
      try {
        await createUserObject(values.groupId, payload);
        message.success(t("addedToGroupSuccessfully"));
        setAddToGroupVisible(false);
      } catch (err) {
        message.error(err.message || t("failedToAddModelToGroup"));
      } finally {
        setAddToGroupLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  return (
    <div>
      {/* Detail view */}
      {detailItem ? (
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: screens.md ? "nowrap" : "wrap" }}>
          {/* Image */}
          <div style={{ flex: screens.md ? "0 0 45%" : "1 1 100%", maxWidth: screens.md ? "45%" : "100%" }}>
            {detailItem.image_url ? (
              <img
                src={detailItem.image_url}
                alt={detailItem.name}
                loading="lazy"
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  borderRadius: 16,
                  boxShadow: "var(--raised-sm)",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  borderRadius: 16,
                  boxShadow: "var(--raised-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PictureOutlined style={{ fontSize: 48, color: "var(--neu-text-2)" }} />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <DetailRow label={t("category")} value={detailItem.category} />
            <DetailRow label={t("scale")} value={detailItem.scale} />
            <DetailRow
              label={t("releasePrice")}
              value={detailItem.release_price ?? detailItem.releasePrice}
            />
            <DetailRow
              label={t("releaseDate")}
              value={detailItem.release_date ?? detailItem.releaseDate}
            />
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={() => openAddToGroup(detailItem)}
              >
                {t("addToGroup")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
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
              {listData.map((item) =>
                item.id === "__add__" ? (
                  <Card
                    key="__add__"
                    hoverable
                    className="neu-model-card"
                    cover={
                      <div
                        style={{
                          position: "relative",
                          paddingTop: "75%",
                          overflow: "hidden",
                          borderRadius: "32px 32px 0 0",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PlusOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
                        </div>
                        <div className="neu-nameplate">{t("addBrandObject")}</div>
                      </div>
                    }
                    onClick={() => {
                      setEditingBrandObject(null);
                      setBrandObjectModalOpen(true);
                    }}
                    bodyStyle={{ padding: 0 }}
                  />
                ) : (
                  <Card
                    key={item.id}
                    hoverable
                    className="neu-model-card"
                    cover={<CardCover image_url={item.image_url} name={item.name} />}
                    onClick={() => setDetailItem(item)}
                    bodyStyle={{ padding: 0 }}
                  />
                )
              )}
            </div>
          </Spin>

          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              paddingTop: 12,
              borderTop: "1px solid rgba(184,182,176,0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setSubmitModalVisible(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--neu-text-2)",
                fontSize: 13,
                textDecoration: "underline",
                padding: 0,
              }}
            >
              {t("reportFeedback")}
            </button>
          </div>
        </>
      )}

      <AddToGroupModal
        visible={addToGroupVisible}
        onOk={handleCreateUserObject}
        onCancel={() => setAddToGroupVisible(false)}
        confirmLoading={addToGroupLoading}
        form={addToGroupForm}
        groups={groups}
        selectedBrandObject={selectedBrandObject}
        customImageData={customImageData}
        onImageChange={setCustomImageData}
      />

      <SubmitObjectModal
        visible={submitModalVisible}
        onCancel={() => setSubmitModalVisible(false)}
        selectedBrand={brand}
        brands={brand ? [brand] : []}
      />

      <BrandModal
        open={brandModalOpen}
        brand={editingBrand}
        onClose={() => setBrandModalOpen(false)}
        onSuccess={() =>
          getBrandByBrandId(brandId)
            .then(setBrand)
            .catch(() => {})
        }
      />

      <BrandObjectModal
        open={brandObjectModalOpen}
        brandObject={editingBrandObject}
        brandId={brandId}
        onClose={() => setBrandObjectModalOpen(false)}
        onSuccess={fetchBrandObjects}
      />
    </div>
  );
}
