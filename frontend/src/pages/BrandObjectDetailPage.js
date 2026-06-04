import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { App, Button, Form, Grid, Popconfirm } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import DetailImage from "../components/DetailImage";
import { DetailPanel, PanelText } from "../components/DetailPanel";
import AddToGroupModal from "../components/ObjectList/modals/AddToGroupModal";
import BrandObjectModal from "../components/ObjectList/modals/BrandObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getBrandObjectById,
  getGroups,
  createUserObject,
  adminDeleteBrandObject,
  purchasePriceFromFormValue,
  formatReleasePrice,
} from "../utils";

const { useBreakpoint } = Grid;

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(184,182,176,0.2)",
      }}
    >
      <span
        style={{
          color: "var(--neu-text-2)",
          fontSize: 13,
          minWidth: 100,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ color: "var(--neu-text)", fontSize: 13, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

export default function BrandObjectDetailPage({ isAdmin, authed = true }) {
  const { brandId, objectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const screens = useBreakpoint();

  const [brandObject, setBrandObject] = useState(
    location.state?.brandObject ?? null,
  );

  const [groups, setGroups] = useState([]);
  const [addToGroupVisible, setAddToGroupVisible] = useState(false);
  const [addToGroupLoading, setAddToGroupLoading] = useState(false);
  const [addToGroupForm] = Form.useForm();
  const [customImageData, setCustomImageData] = useState(null);

  const [brandObjectModalOpen, setBrandObjectModalOpen] = useState(false);

  const fetchBrandObject = useCallback(async () => {
    try {
      const data = await getBrandObjectById(objectId);
      setBrandObject(data);
    } catch (err) {
      message.error(err?.message || t("failedToLoadModels"));
    }
  }, [objectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!brandObject?.brand) {
      fetchBrandObject();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdminDeleteBrandObject = async () => {
    if (!brandObject) return;
    try {
      await adminDeleteBrandObject(brandObject.id);
      message.success(t("brandObjectDeleted"));
      navigate(`/brands/${brandId}`);
    } catch (err) {
      message.error(err?.message || t("failedToDeleteBrandObject"));
    }
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        </div>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--neu-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {brandObject?.name ?? "…"}
        </span>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {isAdmin && brandObject && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => setBrandObjectModalOpen(true)}
              />
              <Popconfirm
                title={t("deleteBrandObjectTitle")}
                description={t("deleteBrandObjectContent").replace(
                  "{name}",
                  brandObject.name,
                )}
                onConfirm={handleAdminDeleteBrandObject}
                okText={t("delete")}
                okButtonProps={{ danger: true }}
                cancelText={t("cancel")}
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </div>
      </div>,
    );
    return () => setHeaderSlot(null);
  }, [brandObject, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddToGroup = async () => {
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
      message.error(err?.message || t("failedToLoadGroups"));
    }
    setAddToGroupVisible(true);
  };

  const description =
    brandObject?.description ??
    brandObject?.description_en ??
    brandObject?.description_zh ??
    null;

  const handleCreateUserObject = async () => {
    try {
      const values = await addToGroupForm.validateFields();
      if (!brandObject) return;
      const payload = {
        brand_object_id: brandObject.id,
        name: values.name,
        image_url: customImageData || brandObject.image_url,
        purchase_date: values.purchaseDate
          ? values.purchaseDate.format("YYYY-MM-DD")
          : null,
        ...purchasePriceFromFormValue(values.purchasePrice),
        other_notes: values.otherNotes || null,
      };
      setAddToGroupLoading(true);
      try {
        await createUserObject(values.groupId, payload);
        message.success(t("addedToGroupSuccessfully"));
        setAddToGroupVisible(false);
      } catch (err) {
        message.error(err?.message || t("failedToAddModelToGroup"));
      } finally {
        setAddToGroupLoading(false);
      }
    } catch {
      // validation failed
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
          flexWrap: screens.md ? "nowrap" : "wrap",
        }}
      >
        <div
          style={{
            flex: screens.md ? "0 0 45%" : "1 1 100%",
            maxWidth: screens.md ? "45%" : "100%",
          }}
        >
          <DetailImage
            imageUrl={brandObject?.image_url}
            alt={brandObject?.name}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <DetailPanel>
            <DetailRow label={t("brand")} value={brandObject?.brand} />
            <DetailRow label={t("series")} value={brandObject?.series} />
            <DetailRow label={t("category")} value={brandObject?.category} />
            <DetailRow label={t("scale")} value={brandObject?.scale} />
            <DetailRow
              label={t("releasePrice")}
              value={formatReleasePrice(brandObject)}
            />
            <DetailRow
              label={t("releaseDate")}
              value={brandObject?.release_date ?? brandObject?.releaseDate}
            />
            <DetailRow
              label={t("imageSource")}
              value={brandObject?.image_source ?? brandObject?.imageSource}
            />
            <PanelText
              label={t("description")}
              text={description}
              className="neu-panel-section"
            />
          </DetailPanel>
          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              block
              icon={<PlusOutlined />}
              onClick={() => (authed ? openAddToGroup() : navigate("/login"))}
            >
              {t("addToGroup")}
            </Button>
          </div>
        </div>
      </div>

      <AddToGroupModal
        visible={addToGroupVisible}
        onOk={handleCreateUserObject}
        onCancel={() => setAddToGroupVisible(false)}
        confirmLoading={addToGroupLoading}
        form={addToGroupForm}
        groups={groups}
        selectedBrandObject={brandObject}
        customImageData={customImageData}
        onImageChange={setCustomImageData}
      />

      <BrandObjectModal
        open={brandObjectModalOpen}
        brandObject={brandObject}
        brandId={brandId}
        onClose={() => setBrandObjectModalOpen(false)}
        onSuccess={fetchBrandObject}
      />
    </div>
  );
}
