import { Button, Modal, Spin } from "antd";
import { Z_INDEX } from "../constants";

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
  if (!userObject) return null;
  const image_url = userObject.image_url;
  const name = userObject.name ?? "—";
  const purchasePrice =
    userObject.purchasePrice ?? userObject.purchase_price;
  const purchaseDate = userObject.purchaseDate ?? userObject.purchase_date;
  const otherNotes = userObject.otherNotes ?? userObject.other_notes ?? "—";

  return (
    <Modal
      zIndex={Z_INDEX.MODAL_USER_OBJECT_DETAIL}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            width: "100%",
            paddingRight: 48,
          }}
        >
          <span>{name}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="small" onClick={onEdit}>
              Edit
            </Button>
            <Button size="small" danger onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
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
        <strong>Name: </strong>
        {name}
      </p>
      <p>
        <strong>Purchase Price: </strong>
        {purchasePrice != null ? purchasePrice : "—"}
      </p>
      <p>
        <strong>Purchase Date: </strong>
        {purchaseDate ?? "—"}
      </p>
      <p>
        <strong>Other Note: </strong>
        {otherNotes}
      </p>
      <div style={{ marginTop: 16 }}>
        <strong>Brand Object:</strong>
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
                src={
                  brandDetail.image_url
                }
                alt={brandDetail.name}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 4,
                  marginRight: 12,
                }}
              />
              <span>{brandDetail.name}</span>
            </div>
          ) : (
            <p style={{ marginTop: 8 }}>No related brand object found.</p>
          )}
        </Spin>
      </div>
    </Modal>
  );
}
