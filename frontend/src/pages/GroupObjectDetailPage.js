import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { App, Form, Grid } from "antd";
import HeaderActionButton from "../components/HeaderActionButton";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import {
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import DetailImage from "../components/DetailImage";
import { DetailPanel, DetailRow, PanelText } from "../components/DetailPanel";
import RelatedModelCard from "../components/RelatedModelCard";
import RelatedModelCardSkeleton from "../components/RelatedModelCardSkeleton";
import ObjectDetailPageSkeleton from "../components/ObjectDetailPageSkeleton";
import { createLazyModal } from "../utils/lazyModal";

const EditUserObjectModal = createLazyModal(
  () => import("../components/ObjectList/modals/EditUserObjectModal"),
);
import useRemoteModelSelectSearch from "../hooks/useRemoteModelSelectSearch";
import { useLocale } from "../LocaleContext";
import { useHeader } from "../HeaderContext";
import { resolveMediaUrl } from "../utils/constants";
import { getBrandObjectById } from "../utils/brandsApi";
import {
  getGroupById,
  getUserObjectById,
  updateUserObject,
  deleteUserObject,
} from "../utils/groupsApi";
import {
  purchasePriceFromFormValue,
  displayPurchasePriceFromObject,
} from "../utils/format";
import { discardUploadedImage } from "../utils/uploadsApi";

const { useBreakpoint } = Grid;

export default function GroupObjectDetailPage() {
  const { groupId, objectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useLocale();
  const { setHeaderSlot } = useHeader();
  const screens = useBreakpoint();

  const [userObject, setUserObject] = useState(
    location.state?.userObject ?? null,
  );
  const [loading, setLoading] = useState(!location.state?.userObject);
  const [group, setGroup] = useState(location.state?.group ?? null);
  const returnSearchRef = useRef(location.state?.returnSearch ?? "");

  useEffect(() => {
    if (location.state?.returnSearch != null) {
      returnSearchRef.current = location.state.returnSearch;
    }
  }, [location.state?.returnSearch]);
  const [brandObjectDetail, setBrandObjectDetail] = useState(null);
  const [loadingBrandObjectDetail, setLoadingBrandObjectDetail] =
    useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editImageData, setEditImageData] = useState(null);
  const {
    results: editSearchResults,
    loading: editSearchLoading,
    onSearch: onEditModelSearch,
    setResults: setEditSearchResults,
  } = useRemoteModelSelectSearch({
    onError: (err) => message.error(err?.message || t("searchFailed")),
  });

  const fetchUserObject = useCallback(async () => {
    setLoading(true);
    try {
      const found = await getUserObjectById(groupId, objectId);
      setUserObject(found);
    } catch (err) {
      message.error(err?.message || t("failedToLoadGroupModels"));
    } finally {
      setLoading(false);
    }
  }, [groupId, objectId, message, t]);

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
    const brandObjectId =
      userObject.brandObjectId ?? userObject.brand_object_id;
    if (!brandObjectId) {
      setBrandObjectDetail(null);
      setLoadingBrandObjectDetail(false);
      return;
    }
    setLoadingBrandObjectDetail(true);
    getBrandObjectById(brandObjectId)
      .then(setBrandObjectDetail)
      .catch(() => setBrandObjectDetail(null))
      .finally(() => setLoadingBrandObjectDetail(false));
  }, [userObject]);

  const handleDelete = async () => {
    if (!userObject) return;
    try {
      await deleteUserObject(groupId, userObject.id);
      message.success(t("modelDeleted"));
      navigate(
        {
          pathname: `/groups/${groupId}`,
          search: returnSearchRef.current,
        },
        { replace: true },
      );
    } catch (err) {
      message.error(err?.message || t("failedToDeleteModel"));
    }
  };

  const openEdit = () => {
    if (!userObject) return;
    const pd = userObject.purchaseDate ?? userObject.purchase_date;
    const brandObjectId =
      userObject.brandObjectId ?? userObject.brand_object_id;
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
          editSearchResults.find(
            (o) => Number(o.id) === Number(values.brandObjectId),
          )) ||
        null;
      const image_url =
        editImageData ?? userObject.image_url ?? selectedBo?.image_url;
      const payload = {
        brand_object_id:
          values.brandObjectId != null && values.brandObjectId !== ""
            ? Number(values.brandObjectId)
            : null,
        name: values.name,
        image_url: image_url || null,
        purchase_date: values.purchaseDate
          ? values.purchaseDate.format("YYYY-MM-DD")
          : null,
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
        const newBrandObjectId =
          updated.brandObjectId ?? updated.brand_object_id;
        if (newBrandObjectId == null) {
          setBrandObjectDetail(null);
        } else if (
          selectedBo &&
          Number(selectedBo.id) === Number(newBrandObjectId)
        ) {
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

  const handleEditSearch = (value) => {
    const keyword = (value || "").trim();
    if (keyword === "") {
      setEditSearchResults(brandObjectDetail ? [brandObjectDetail] : []);
      return;
    }
    onEditModelSearch(keyword);
  };

  useLayoutEffect(() => {
    setHeaderSlot(
      <div className="header-slot-bar">
        <div className="header-slot-actions">
          <HeaderActionButton
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (location.state?.returnSearch != null) {
                navigate({
                  pathname: `/groups/${groupId}`,
                  search: returnSearchRef.current,
                });
              } else {
                navigate(-1);
              }
            }}
          />
        </div>
        {userObject && (
          <div className="header-slot-actions header-slot-actions-end">
            <HeaderActionButton icon={<EditOutlined />} onClick={openEdit} />
            <ConfirmDeleteButton variant="header" onConfirm={handleDelete} />
          </div>
        )}
        <span className="header-slot-title">{userObject?.name ?? "…"}</span>
      </div>,
    );
    return () => setHeaderSlot(null);
  }, [userObject]); // eslint-disable-line react-hooks/exhaustive-deps

  const purchasePrice = userObject
    ? (userObject.purchasePrice ?? userObject.purchase_price)
    : null;
  const purchaseDate = userObject
    ? (userObject.purchaseDate ?? userObject.purchase_date)
    : null;
  const otherNotes = userObject
    ? (userObject.otherNotes ?? userObject.other_notes)
    : null;
  const imageUrl = userObject?.imageUrl ?? userObject?.image_url ?? null;

  if (loading && !userObject) {
    return <ObjectDetailPageSkeleton showRelatedModel />;
  }

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
            imageUrl={imageUrl}
            alt={userObject?.name ?? ""}
            onClick={
              imageUrl
                ? () => window.open(resolveMediaUrl(imageUrl), "_blank")
                : undefined
            }
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <DetailPanel>
            <DetailRow label={t("purchasePrice")} value={purchasePrice} />
            <DetailRow label={t("purchaseDate")} value={purchaseDate} />
            <PanelText
              label={t("notes")}
              text={otherNotes}
              className="neu-panel-section"
            />
          </DetailPanel>

          {loadingBrandObjectDetail || brandObjectDetail ? (
            <div className="neu-detail-follow-on">
              <div className="neu-panel-label">{t("brandModelLabel")}</div>
              {loadingBrandObjectDetail ? (
                <RelatedModelCardSkeleton />
              ) : (
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
              )}
            </div>
          ) : null}
        </div>
      </div>

      <EditUserObjectModal
        visible={editVisible}
        onOk={handleUpdate}
        onCancel={() => {
          if (editImageData)
            discardUploadedImage(editImageData).catch(() => {});
          setEditImageData(null);
          setEditVisible(false);
        }}
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
