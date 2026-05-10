import { Button, Card, Drawer, Grid, Input, Spin } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { DRAWER_WIDTH } from "./constants";
import { useLocale } from "../../LocaleContext";

const { useBreakpoint } = Grid;
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
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const cols = screens.xl ? 4 : screens.md ? 3 : 2;
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
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--neu-text)", wordBreak: "break-word" }}>
            {detailUserObject.name ?? "—"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button icon={<EditOutlined />} onClick={onEditUserObject} />
          <Button danger icon={<DeleteOutlined />} onClick={onDeleteUserObject} />
        </div>
      </div>
    );
  } else if (selectedGroup) {
    drawerTitle = (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, width: "100%", paddingRight: 40 }}>
        <span style={{ wordBreak: "break-word", minWidth: 0, flex: 1 }}>{selectedGroup.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Button icon={<EditOutlined />} onClick={onEditGroup} />
          <Button danger icon={<DeleteOutlined />} onClick={onDeleteGroup} />
          {!isMobile && (
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
          )}
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
      width={isMobile ? "100%" : DRAWER_WIDTH}
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
            {brandDetail.image_url ? (
              <img
                src={brandDetail.image_url}
                alt={brandDetail.name}
                loading="lazy"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PictureOutlined style={{ fontSize: 48, color: "var(--neu-text-2)" }} />
              </div>
            )}
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
            {detailUserObject.image_url ? (
              <img
                src={detailUserObject.image_url}
                alt={detailUserObject.name ?? ""}
                loading="lazy"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, marginBottom: 20, boxShadow: "var(--raised-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PictureOutlined style={{ fontSize: 48, color: "var(--neu-text-2)" }} />
              </div>
            )}
            <DetailRow label={t("purchasePrice")} value={purchasePrice != null ? purchasePrice : null} />
            <DetailRow label={t("purchaseDate")} value={purchaseDate} />
            <DetailRow label={t("notes")} value={otherNotes} />

            <div style={{ marginTop: 16 }}>
              <div style={{ color: "var(--neu-text-2)", fontSize: 13, marginBottom: 8 }}>{t("brandModelLabel")}</div>
              <Spin spinning={loadingBrandDetail}>
                {brandDetail ? (
                  <button
                    type="button"
                    onClick={() => setShowBrandDetail(true)}
                    className="neu-clickable"
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10 }}
                  >
                    {brandDetail.image_url ? (
                      <img
                        src={brandDetail.image_url}
                        alt={brandDetail.name}
                        style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PictureOutlined style={{ fontSize: 20, color: "var(--neu-text-2)" }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--neu-text)" }}>{brandDetail.name}</div>
                      {(brandDetail.category || brandDetail.scale) && (
                        <div style={{ fontSize: 12, color: "var(--neu-text-2)", marginTop: 2 }}>
                          {[brandDetail.category, brandDetail.scale].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                  </button>
                ) : (
                  <div style={{ color: "var(--neu-text-2)", fontSize: 13 }}>{t("noRelatedBrandModel")}</div>
                )}
              </Spin>
            </div>
          </div>
        ) : (
          <div style={{ minHeight: 200 }}>
            {isMobile && (
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
                style={{ width: "100%", marginBottom: 16 }}
              />
            )}
            <Spin spinning={loading}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: 16,
                }}
              >
                {[{ id: "__add__" }, ...filteredObjects].map((item) =>
                  item.id === "__add__" ? (
                    <Card
                      key="__add__"
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
                      key={item.id}
                      hoverable
                      bodyStyle={{ height: 56, minHeight: 56, padding: "0 24px", overflow: "hidden", display: "flex", alignItems: "center" }}
                      cover={
                        item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name ?? ""}
                            loading="lazy"
                            style={{ width: "100%", height: 200, objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <PictureOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
                          </div>
                        )
                      }
                      onClick={() => onUserObjectClick(item)}
                    >
                      <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name ?? "—"}
                      </div>
                    </Card>
                  )
                )}
              </div>
            </Spin>
          </div>
        )
      )}
    </Drawer>
  );
}
