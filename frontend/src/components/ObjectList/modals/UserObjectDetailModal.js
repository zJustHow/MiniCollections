import NeuButton from "../../NeuButton";
import ConfirmDeleteButton from "../../ConfirmDeleteButton";
import RelatedModelCard from "../../RelatedModelCard";
import RelatedModelCardSkeleton from "../../RelatedModelCardSkeleton";
import { EditOutlined } from "@ant-design/icons";
import NeuFormDrawer from "../../NeuFormDrawer";
import { Z_INDEX } from "../constants";
import { useLocale } from "../../../LocaleContext";

export default function UserObjectDetailModal({
  visible,
  onCancel,
  userObject,
  brandDetail,
  loadingBrandDetail,
  onEdit,
  onDelete,
  onBrandObjectClick,
}) {
  const { t } = useLocale();
  if (!userObject) return null;
  const image_url = userObject.image_url;
  const name = userObject.name ?? "—";
  const purchasePrice =
    userObject.purchasePrice ?? userObject.purchase_price;
  const purchaseDate = userObject.purchaseDate ?? userObject.purchase_date;
  const otherNotes = userObject.otherNotes ?? userObject.other_notes ?? "—";

  return (
    <NeuFormDrawer
      zIndex={Z_INDEX.MODAL_USER_OBJECT_DETAIL}
      title={name}
      open={visible}
      onClose={onCancel}
      footer={null}
      extra={
        <div style={{ display: "flex", gap: 8 }}>
          <NeuButton size="small" icon={<EditOutlined />} onClick={onEdit} />
          <ConfirmDeleteButton variant="neu" size="small" onConfirm={onDelete} />
        </div>
      }
    >
      <img
        src={image_url}
        alt={name}
        loading="lazy"
        style={{
          width: "100%",
          maxHeight: 320,
          objectFit: "contain",
          marginBottom: 16,
        }}
      />
      <p>
        <strong>{t("name")}: </strong>
        {name}
      </p>
      <p>
        <strong>{t("purchasePrice")}: </strong>
        {purchasePrice != null ? purchasePrice : "—"}
      </p>
      <p>
        <strong>{t("purchaseDate")}: </strong>
        {purchaseDate ?? "—"}
      </p>
      <p>
        <strong>{t("otherNote")}: </strong>
        {otherNotes}
      </p>
      <div style={{ marginTop: 16 }}>
        <strong>{t("brandModelLabel")}:</strong>
        {loadingBrandDetail ? (
          <div style={{ marginTop: 8 }}>
            <RelatedModelCardSkeleton />
          </div>
        ) : brandDetail ? (
          <div style={{ marginTop: 8 }}>
            <RelatedModelCard
              brandObject={brandDetail}
              onClick={onBrandObjectClick}
            />
          </div>
        ) : (
          <p style={{ marginTop: 8 }}>{t("noRelatedBrandObjectFound")}</p>
        )}
      </div>
    </NeuFormDrawer>
  );
}
