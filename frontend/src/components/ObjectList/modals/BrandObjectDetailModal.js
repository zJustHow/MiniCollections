import { Modal } from "antd";
import { Z_INDEX } from "../constants";
import { useLocale } from "../../../LocaleContext";

export default function BrandObjectDetailModal({
  visible,
  onCancel,
  detail,
}) {
  const { t } = useLocale();
  if (!detail) return null;
  return (
    <Modal
      title={t("brandObjectModalTitle", { name: detail.name })}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      zIndex={Z_INDEX.MODAL_BRAND_OBJECT_DETAIL}
    >
      <img
        src={detail.image_url}
        alt={detail.name}
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
        {detail.name ?? "—"}
      </p>
      <p>
        <strong>{t("category")}: </strong>
        {detail.category ?? "—"}
      </p>
      <p>
        <strong>{t("scale")}: </strong>
        {detail.scale ?? "—"}
      </p>
      <p>
        <strong>{t("releasePrice")}: </strong>
        {detail.release_price != null
          ? detail.release_price
          : detail.releasePrice != null
            ? detail.releasePrice
            : "—"}
      </p>
      <p>
        <strong>{t("releaseDate")}: </strong>
        {detail.release_date ?? detail.releaseDate ?? "—"}
      </p>
    </Modal>
  );
}
