import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { App, Form, Grid, Popconfirm } from "antd";
import NeuButton, { neuBtnProps } from "../components/NeuButton";
import HeaderActionButton from "../components/HeaderActionButton";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import DetailImage from "../components/DetailImage";
import { DetailPanel, DetailRow, PanelText } from "../components/DetailPanel";
import AddToGroupModal from "../components/ObjectList/modals/AddToGroupModal";
import BrandObjectModal from "../components/ObjectList/modals/BrandObjectModal";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import {
  getBrandObjectById,
  getGroupsPage,
  createUserObject,
  adminDeleteBrandObject,
  purchasePriceFromFormValue,
  formatReleasePrice,
  discardUploadedImage,
  recordModelView,
  formatViewCount,
} from "../utils";

const { useBreakpoint } = Grid;

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

  useEffect(() => {
    if (isAdmin || !objectId) return;
    const key = `viewed:model:${objectId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    recordModelView(objectId);
  }, [objectId, isAdmin]);

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

  useLayoutEffect(() => {
    setHeaderSlot(
      <div className="header-slot-bar">
        <div className="header-slot-actions">
          <HeaderActionButton
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
        </div>
        {isAdmin && brandObject && (
          <div className="header-slot-actions header-slot-actions-end">
            <HeaderActionButton
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
              okButtonProps={neuBtnProps({ danger: true })}
              cancelButtonProps={neuBtnProps()}
              cancelText={t("cancel")}
            >
              <HeaderActionButton danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        )}
        <span className="header-slot-title">{brandObject?.name ?? "…"}</span>
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
      const data = await getGroupsPage({ page: 0, size: 100 });
      setGroups(data?.content ?? []);
    } catch (err) {
      message.error(err?.message || t("failedToLoadGroups"));
    }
    setAddToGroupVisible(true);
  };

  const description =
    [
      brandObject?.description,
      brandObject?.description_en,
      brandObject?.description_zh,
    ]
      .map((value) => (typeof value === "string" ? value.trim() : value))
      .find((value) => value != null && value !== "" && value !== "—") ?? null;

  const viewCountLabel = formatViewCount(
    brandObject?.view_count ?? brandObject?.viewCount,
    t,
  );

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
            {viewCountLabel && (
              <DetailRow label={t("viewCount")} value={viewCountLabel} />
            )}
            <PanelText
              label={t("description")}
              text={description}
              className="neu-panel-section"
            />
          </DetailPanel>
          <div className="neu-detail-follow-on">
            <NeuButton
              type="primary"
              block
              icon={<PlusOutlined />}
              onClick={() => (authed ? openAddToGroup() : navigate("/login"))}
            >
              {t("addToGroup")}
            </NeuButton>
          </div>
        </div>
      </div>

      <AddToGroupModal
        visible={addToGroupVisible}
        onOk={handleCreateUserObject}
        onCancel={() => {
          if (customImageData)
            discardUploadedImage(customImageData).catch(() => {});
          setCustomImageData(null);
          setAddToGroupVisible(false);
        }}
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
