import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { App, Form } from "antd";
import NeuButton from "../components/NeuButton";
import HeaderActionButton from "../components/HeaderActionButton";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import ArrowLeftOutlined from "@ant-design/icons/es/icons/ArrowLeftOutlined.js";
import EditOutlined from "@ant-design/icons/es/icons/EditOutlined.js";
import PlusOutlined from "@ant-design/icons/es/icons/PlusOutlined.js";
import DetailImage from "../components/DetailImage";
import ObjectDetailPageSkeleton from "../components/ObjectDetailPageSkeleton";
import { DetailPanel, DetailRow, PanelText } from "../components/DetailPanel";
import { createLazyModal } from "../utils/lazyModal";

const AddToGroupModal = createLazyModal(
  () => import("../components/ObjectList/modals/AddToGroupModal"),
);
const BrandObjectModal = createLazyModal(
  () => import("../components/ObjectList/modals/BrandObjectModal"),
);
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import { resolveMediaUrl } from "../utils/constants";
import { getBrandObjectById, recordModelView } from "../utils/brandsApi";
import { getGroupsPage, createUserObject } from "../utils/groupsApi";
import { adminDeleteBrandObject } from "../utils/adminApi";
import {
  purchasePriceFromFormValue,
  formatReleasePrice,
  formatViewCount,
} from "../utils/format";
import { discardUploadedImage } from "../utils/uploadsApi";
import { resolveImageFieldPayload } from "../utils/imageFieldOverride";
import { hydrateBrandObjectFromRouteState } from "../utils/objectDetailRouteState";
import { scrollAppToTop } from "../utils/scroll";

export default function BrandObjectDetailPage({ isAdmin, authed = true }) {
  const { brandId, objectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t, locale } = useLocale();
  const { setHeaderSlot } = useHeader();
  const [brandObject, setBrandObject] = useState(() =>
    hydrateBrandObjectFromRouteState(location.state, locale),
  );
  const [loading, setLoading] = useState(
    () => !hydrateBrandObjectFromRouteState(location.state, locale)?.brand,
  );

  const [groups, setGroups] = useState([]);
  const [addToGroupVisible, setAddToGroupVisible] = useState(false);
  const [addToGroupLoading, setAddToGroupLoading] = useState(false);
  const [addToGroupForm] = Form.useForm();
  const [customImageData, setCustomImageData] = useState(undefined);

  const [brandObjectModalOpen, setBrandObjectModalOpen] = useState(false);

  const fetchBrandObject = useCallback(
    async ({ background = false } = {}) => {
      if (!background) setLoading(true);
      try {
        const data = await getBrandObjectById(objectId);
        if (data) setBrandObject(data);
      } catch (err) {
        if (!background) {
          message.error(err?.message || t("failedToLoadModels"));
        }
      } finally {
        if (!background) setLoading(false);
      }
    },
    [objectId, message, t],
  );

  useEffect(() => {
    const hydrated = hydrateBrandObjectFromRouteState(location.state, locale);
    setBrandObject(hydrated);
    setLoading(!hydrated?.brand);
    fetchBrandObject({ background: Boolean(hydrated?.brand) });
  }, [objectId, location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    scrollAppToTop();
  }, [objectId]);

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

  const showSkeleton = loading && !brandObject?.brand;

  useLayoutEffect(() => {
    if (showSkeleton) {
      setHeaderSlot(null);
      return () => setHeaderSlot(null);
    }

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
            <ConfirmDeleteButton
              variant="header"
              onConfirm={handleAdminDeleteBrandObject}
            />
          </div>
        )}
        <span className="header-slot-title">{brandObject?.name ?? "…"}</span>
      </div>,
    );
    return () => setHeaderSlot(null);
  }, [showSkeleton, brandObject, isAdmin, location.pathname, setHeaderSlot]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddToGroup = async () => {
    setCustomImageData(undefined);
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
        image_url: resolveImageFieldPayload(
          customImageData,
          brandObject.image_url,
          brandObject.imageUrl,
        ),
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

  if (showSkeleton) {
    return <ObjectDetailPageSkeleton />;
  }

  return (
    <div>
      <div className="neu-object-detail-layout">
        <div className="neu-object-detail-image-col">
          <DetailImage
            imageUrl={brandObject?.image_url}
            alt={brandObject?.name}
            onClick={
              brandObject?.image_url
                ? () =>
                    window.open(
                      resolveMediaUrl(brandObject.image_url),
                      "_blank",
                    )
                : undefined
            }
          />
        </div>

        <div className="neu-object-detail-info-col">
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
          setCustomImageData(undefined);
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
