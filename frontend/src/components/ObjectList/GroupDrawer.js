import { Button, Card, Drawer, Input, List, Spin } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { LIST_GRID_DRAWER, DRAWER_WIDTH } from "./constants";
import { useLocale } from "../../LocaleContext";

const { Search } = Input;


function DetailRow({ label, value }) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}>
      <span style={{ color: "var(--neu-text-2)", fontSize: 13, minWidth: 110, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color: "var(--neu-text)", fontSize: 13, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

export default function GroupDrawer({
  open,
  onClose,
  selectedGroup,
  userObjects,
  loading,
  searchKeyword,
  onSearchChange,
  onUserObjectClick,
  onEditGroup,
  onDeleteGroup,
  onAddModel,
  detailUserObject,
  onDetailClose,
  brandDetail,
  loadingBrandDetail,
  onEditUserObject,
  onDeleteUserObject,
}) {
  const { t } = useLocale();
  const [draftQuery, setDraftQuery] = useState("");
  const [showBrandDetail, setShowBrandDetail] = useState(false);

  useEffect(() => {
    setShowBrandDetail(false);
  }, [detailUserObject]);

  useEffect(() => {
    if (!open || !selectedGroup) return;
    setDraftQuery("");
    onSearchChange("");
  }, [open, selectedGroup?.id, onSearchChange]);

  const filteredObjects = searchKeyword.trim()
    ? userObjects.filter((item) =>
        (item.name ?? "").toLowerCase().includes(searchKeyword.trim().toLowerCase())
      )
    : userObjects;

  const handleClose = () => {
    onClose();
  };

  const isUserObjectDetail = detailUserObject != null;
  const isBrandDetail = isUserObjectDetail && showBrandDetail;

  const purchasePrice = detailUserObject
    ? (detailUserObject.purchasePrice ?? detailUserObject.purchase_price)
    : null;
  const purchaseDate = detailUserObject
    ? (detailUserObject.purchaseDate ?? detailUserObject.purchase_date)
    : null;
  const otherNotes = detailUserObject
    ? (detailUserObject.otherNotes ?? detailUserObject.other_notes)
    : null;

  let drawerTitle;
  if (isBrandDetail) {
    drawerTitle = (
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
        <button
          type="button"
          onClick={() => setShowBrandDetail(false)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--neu-text-2)", display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <ArrowLeftOutlined style={{ fontSize: 16 }} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {brandDetail?.name ?? t("brandModelLabel")}
        </span>
      </div>
    );
  } else if (isUserObjectDetail) {
    drawerTitle = (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingRight: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            type="button"
            onClick={onDetailClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--neu-text-2)", display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <ArrowLeftOutlined style={{ fontSize: 16 }} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {detailUserObject.name ?? "—"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button size="small" icon={<EditOutlined />} onClick={onEditUserObject} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={onDeleteUserObject} />
        </div>
      </div>
    );
  } else if (selectedGroup) {
    drawerTitle = (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, width: "100%", paddingRight: 40 }}>
        <span>{selectedGroup.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={onEditGroup} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={onDeleteGroup} />
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
            style={{ width: 200 }}
          />
        </div>
      </div>
    );
  } else {
    drawerTitle = null;
  }

  return (
    <Drawer
      title={drawerTitle}
      open={open}
      onClose={handleClose}
      width={DRAWER_WIDTH}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          setDraftQuery("");
          setShowBrandDetail(false);
          onSearchChange("");
        }
      }}
    >
      {selectedGroup && (
        isBrandDetail ? (
          <div>
            <img
              src={brandDetail.image_url}
              alt={brandDetail.name}
              loading="lazy"
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)" }}
            />
            <DetailRow label={t("category")} value={brandDetail.category} />
            <DetailRow label={t("scale")} value={brandDetail.scale} />
            <DetailRow
              label={t("releasePrice")}
              value={brandDetail.release_price ?? brandDetail.releasePrice}
            />
            <DetailRow
              label={t("releaseDate")}
              value={brandDetail.release_date ?? brandDetail.releaseDate}
            />
          </div>
        ) : isUserObjectDetail ? (
          <div>
            <img
              src={detailUserObject.image_url}
              alt={detailUserObject.name ?? ""}
              loading="lazy"
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)" }}
            />
            <DetailRow label={t("purchasePrice")} value={purchasePrice != null ? purchasePrice : null} />
            <DetailRow label={t("purchaseDate")} value={purchaseDate} />
            <DetailRow label={t("notes")} value={otherNotes} />

            <div style={{ marginTop: 16 }}>
              <div style={{ color: "var(--neu-text-2)", fontSize: 13, marginBottom: 8 }}>{t("brandModelLabel")}</div>
              <Spin spinning={loadingBrandDetail}>
                {brandDetail ? (
                  <div
                    onClick={() => setShowBrandDetail(true)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", boxShadow: "var(--raised-sm)" }}
                  >
                    <img
                      src={brandDetail.image_url}
                      alt={brandDetail.name}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neu-text)" }}>{brandDetail.name}</div>
                      {(brandDetail.category || brandDetail.scale) && (
                        <div style={{ fontSize: 12, color: "var(--neu-text-2)", marginTop: 2 }}>
                          {[brandDetail.category, brandDetail.scale].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "var(--neu-text-2)", fontSize: 13 }}>{t("noRelatedBrandModel")}</div>
                )}
              </Spin>
            </div>
          </div>
        ) : (
          <div style={{ minHeight: 200 }}>
            <List
              loading={loading}
              grid={LIST_GRID_DRAWER}
              dataSource={[{ id: "__add__" }, ...filteredObjects]}
              locale={{ emptyText: null }}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  {item.id === "__add__" ? (
                    <Card
                      hoverable
                      bodyStyle={{ height: 56, minHeight: 56, padding: "0 24px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
                      cover={
                        <div
                          style={{
                            width: "100%",
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PlusOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
                        </div>
                      }
                      onClick={onAddModel}
                    >
                      <div style={{ color: "var(--neu-text-2)", textAlign: "center" }}>
                        {t("addModel")}
                      </div>
                    </Card>
                  ) : (
                    <Card
                      hoverable
                      bodyStyle={{ height: 56, minHeight: 56, padding: "0 24px", overflow: "hidden", display: "flex", alignItems: "center" }}
                      cover={
                        <img
                          src={item.image_url}
                          alt={item.name ?? ""}
                          loading="lazy"
                          style={{ width: "100%", height: 200, objectFit: "cover" }}
                        />
                      }
                      onClick={() => onUserObjectClick(item)}
                    >
                      <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name ?? "—"}
                      </div>
                    </Card>
                  )}
                </List.Item>
              )}
            />
          </div>
        )
      )}
    </Drawer>
  );
}
