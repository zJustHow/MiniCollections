import NeuButton from "../../NeuButton";
import ConfirmDeleteButton from "../../ConfirmDeleteButton";
import { Spin } from "antd";
import { EditOutlined } from "@ant-design/icons";
import NeuFormDrawer from "../../NeuFormDrawer";
import { Z_INDEX } from "../constants";
import { useLocale } from "../../../LocaleContext";
import { radius } from "../../../theme/radius";

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
      width={600}
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
        <Spin spinning={loadingBrandDetail}>
          {brandDetail ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 8,
                cursor: "pointer",
              }}
              onClick={onBrandObjectClick}
            >
              <img
                src={brandDetail.image_url}
                alt={brandDetail.name}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: radius.xs,
                  marginRight: 12,
                }}
              />
              <span>
                {brandDetail.name}
                {(brandDetail.category || brandDetail.scale) && (
                  <span style={{ color: "#888", marginLeft: 8 }}>
                    {[brandDetail.category, brandDetail.scale]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <p style={{ marginTop: 8 }}>{t("noRelatedBrandObjectFound")}</p>
          )}
        </Spin>
      </div>
    </NeuFormDrawer>
  );
}
