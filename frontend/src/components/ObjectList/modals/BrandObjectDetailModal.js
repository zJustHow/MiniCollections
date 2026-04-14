import { Modal } from "antd";
import { Z_INDEX } from "../constants";

export default function BrandObjectDetailModal({
  visible,
  onCancel,
  detail,
}) {
  if (!detail) return null;
  return (
    <Modal
      title={`Brand Object: ${detail.name}`}
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
        <strong>Name: </strong>
        {detail.name ?? "—"}
      </p>
      <p>
        <strong>Category: </strong>
        {detail.category ?? "—"}
      </p>
      <p>
        <strong>Scale: </strong>
        {detail.scale ?? "—"}
      </p>
      <p>
        <strong>Release Price: </strong>
        {detail.release_price != null
          ? detail.release_price
          : detail.releasePrice != null
            ? detail.releasePrice
            : "—"}
      </p>
      <p>
        <strong>Release Date: </strong>
        {detail.release_date ?? detail.releaseDate ?? "—"}
      </p>
    </Modal>
  );
}
