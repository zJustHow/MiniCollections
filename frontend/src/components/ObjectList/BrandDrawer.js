import { Card, Drawer, Input, List, Spin } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { LIST_GRID_DRAWER, DRAWER_WIDTH } from "./constants";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;

const addButtonStyle = {
  position: "absolute",
  right: 10,
  bottom: 10,
  width: 32,
  height: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

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

  const filteredObjects = searchKeyword.trim()
    ? brandObjects.filter((bo) =>
        (bo.name || "").toLowerCase().includes(searchKeyword.trim().toLowerCase())
      )
    : brandObjects;

  const handleClose = () => {
    onClose();
  };

  const isDetail = detailItem !== null;

  const drawerTitle = isDetail ? (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        onClick={() => setDetailItem(null)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--neu-text-2)", display: "flex", alignItems: "center" }}
      >
        <ArrowLeftOutlined style={{ fontSize: 16 }} />
      </button>
      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--neu-text)" }}>
        {detailItem.name}
      </span>
    </div>
  ) : selectedBrand ? (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, width: "100%", paddingRight: 8 }}>
      <span>{selectedBrand.name}</span>
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
                dataSource={filteredObjects}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <Card
                      hoverable
                      onClick={() => setDetailItem(item)}
                      bodyStyle={{ height: 56, minHeight: 56, padding: "0 16px", overflow: "hidden", display: "flex", alignItems: "center" }}
                      cover={
                        <div style={{ position: "relative", width: "100%", height: 200, overflow: "hidden" }}>
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onAddToGroup(item); }}
                            style={addButtonStyle}
                            className="neu-add-btn"
                          >
                            <PlusOutlined />
                          </button>
                        </div>
                      }
                    >
                      <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13 }}>
                        {item.name}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Spin>
          </div>
          {detailItem && (
            <div style={{ display: isDetail ? "block" : "none" }}>
              <img
                src={detailItem.image_url}
                alt={detailItem.name}
                loading="lazy"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)" }}
              />
              <DetailRow label={t("category")} value={detailItem.category} />
              <DetailRow label={t("scale")} value={detailItem.scale} />
              <DetailRow
                label={t("releasePrice")}
                value={detailItem.release_price ?? detailItem.releasePrice}
              />
              <DetailRow
                label={t("releaseDate")}
                value={detailItem.release_date ?? detailItem.releaseDate}
              />
              <div style={{ marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => onAddToGroup(detailItem)}
                  className="neu-add-btn"
                  style={{ width: "100%", height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }}
                >
                  <PlusOutlined /> {t("addToGroup")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
