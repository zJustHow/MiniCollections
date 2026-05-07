import { Button, Card, Drawer, Input, List, Popconfirm, Spin } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { LIST_GRID_DRAWER, DRAWER_WIDTH } from "./constants";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;

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

export default function BrandDrawer({
  open,
  onClose,
  selectedBrand,
  brandObjects,
  loading,
  searchKeyword,
  onSearchChange,
  onAddToGroup,
  onSubmitMissing,
  isAdmin,
  onCreateBrandObject,
  onEditBrandObject,
  onDeleteBrandObject,
  onEditBrand,
  onDeleteBrand,
}) {
  const { t } = useLocale();
  const [draftQuery, setDraftQuery] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    if (!open || !selectedBrand) return;
    setDraftQuery("");
    setDetailItem(null);
    onSearchChange("");
  }, [open, selectedBrand?.id, onSearchChange]);

  // Sync detailItem when brandObjects refreshes (after edit or delete)
  useEffect(() => {
    if (!detailItem) return;
    const updated = brandObjects.find((o) => o.id === detailItem.id);
    setDetailItem(updated ?? null);
  }, [brandObjects]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredObjects = searchKeyword.trim()
    ? brandObjects.filter((bo) =>
        (bo.name || "").toLowerCase().includes(searchKeyword.trim().toLowerCase())
      )
    : brandObjects;

  const listData = isAdmin ? [{ id: "__add__" }, ...filteredObjects] : filteredObjects;

  const handleClose = () => {
    onClose();
  };

  const isDetail = detailItem !== null;

  const drawerTitle = isDetail ? (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingRight: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => setDetailItem(null)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--neu-text-2)", display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <ArrowLeftOutlined style={{ fontSize: 16 }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {detailItem.name}
        </span>
      </div>
      {isAdmin && (
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEditBrandObject?.(detailItem)} />
          <Popconfirm
            title={t("deleteBrandObjectTitle")}
            description={t("deleteBrandObjectContent").replace("{name}", detailItem.name)}
            onConfirm={async () => { await onDeleteBrandObject?.(detailItem); }}
            okText={t("delete")}
            okButtonProps={{ danger: true }}
            cancelText={t("cancel")}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )}
    </div>
  ) : selectedBrand ? (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, width: "100%", paddingRight: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span>{selectedBrand.name}</span>
        {isAdmin && (
          <>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditBrand?.(selectedBrand)}
            />
            <Popconfirm
              title={t("deleteBrandTitle")}
              description={t("deleteBrandContent").replace("{name}", selectedBrand.name)}
              onConfirm={() => onDeleteBrand?.(selectedBrand)}
              okText={t("delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("cancel")}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </>
        )}
      </div>
      <Search
        placeholder={t("searchModels")}
        allowClear
        value={draftQuery}
        onChange={(e) => {
          const v = e.target.value;
          setDraftQuery(v);
          if (v === "") onSearchChange("");
        }}
        onSearch={(v) => onSearchChange((v ?? "").trim())}
        style={{ width: 220 }}
      />
    </div>
  ) : null;

  return (
    <Drawer
      title={drawerTitle}
      open={open}
      onClose={handleClose}
      width={DRAWER_WIDTH}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          setDraftQuery("");
          setDetailItem(null);
          onSearchChange("");
        }
      }}
    >
      {selectedBrand && (
        <>
          <div style={{ display: isDetail ? "none" : "block" }}>
            <Spin spinning={loading}>
              <List
                grid={LIST_GRID_DRAWER}
                dataSource={listData}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    {item.id === "__add__" ? (
                      <Card
                        hoverable
                        onClick={() => onCreateBrandObject?.()}
                        bodyStyle={{ height: 56, minHeight: 56, padding: "0 16px", overflow: "hidden", display: "flex", alignItems: "center" }}
                        cover={
                          <div
                            style={{
                              height: 200,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "var(--neu-bg-2, rgba(180,180,180,0.08))",
                            }}
                          >
                            <PlusOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
                          </div>
                        }
                      >
                        <span style={{ fontSize: 13, color: "var(--neu-text-2)" }}>{t("addBrandObject")}</span>
                      </Card>
                    ) : (
                      <Card
                        hoverable
                        onClick={() => setDetailItem(item)}
                        bodyStyle={{ height: 56, minHeight: 56, padding: "0 16px", overflow: "hidden", display: "flex", alignItems: "center" }}
                        cover={
                          item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              loading="lazy"
                              style={{ width: "100%", height: 200, objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <PictureOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
                            </div>
                          )
                        }
                      >
                        <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13 }}>
                          {item.name}
                        </div>
                      </Card>
                    )}
                  </List.Item>
                )}
              />
            </Spin>
          </div>
          {onSubmitMissing && !isDetail && (
            <div style={{ textAlign: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(184,182,176,0.2)" }}>
              <button
                type="button"
                onClick={onSubmitMissing}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neu-text-2)", fontSize: 13, textDecoration: "underline", padding: 0 }}
              >
                {t("reportFeedback")}
              </button>
            </div>
          )}
          {detailItem && (
            <div style={{ display: isDetail ? "block" : "none" }}>
              {detailItem.image_url ? (
                <img
                  src={detailItem.image_url}
                  alt={detailItem.name}
                  loading="lazy"
                  style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)" }}
                />
              ) : (
                <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PictureOutlined style={{ fontSize: 48, color: "var(--neu-text-2)" }} />
                </div>
              )}
              <DetailRow label={t("category")} value={detailItem.category} />
              <DetailRow label={t("scale")} value={detailItem.scale} />
              <DetailRow label={t("releasePrice")} value={detailItem.release_price ?? detailItem.releasePrice} />
              <DetailRow label={t("releaseDate")} value={detailItem.release_date ?? detailItem.releaseDate} />
              <div style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => onAddToGroup(detailItem)}
                >
                  {t("addToGroup")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
