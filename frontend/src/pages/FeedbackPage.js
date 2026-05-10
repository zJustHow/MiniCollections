import {
  App, Button, Drawer, Empty, Spin, Tag, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocale } from "../LocaleContext";
import { getBrands, getMySubmissions } from "../utils";
import SubmitObjectModal from "../components/ObjectList/modals/SubmitObjectModal";
import dayjs from "dayjs";

const { Text } = Typography;

const STATUS_COLOR = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "red",
  RESOLVED: "cyan",
  CLOSED: "default",
};

const TYPE_COLOR = {
  MISSING_MODEL: "blue",
  BUG_REPORT: "volcano",
  DATA_CORRECTION: "purple",
};

function typeLabel(type, t) {
  if (type === "MISSING_MODEL") return t("feedbackTypeMissingModel");
  if (type === "BUG_REPORT") return t("feedbackTypeBugReport");
  if (type === "DATA_CORRECTION") return t("feedbackTypeDataCorrection");
  return type;
}

function statusLabel(status, t) {
  if (status === "PENDING") return t("statusPending");
  if (status === "APPROVED") return t("statusApproved");
  if (status === "REJECTED") return t("statusRejected");
  if (status === "RESOLVED") return t("statusResolved");
  if (status === "CLOSED") return t("statusClosed");
  return status;
}

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}>
      <span style={{ color: "var(--neu-text-2)", fontSize: 13, minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--neu-text)", fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function SubmissionCard({ item, t, onClick }) {
  const title = item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—";
  const brand = item.brand_name || item.custom_brand_name;

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--neu-bg)",
        borderRadius: 14,
        padding: "14px 18px",
        boxShadow: "var(--raised-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
          <Tag color={TYPE_COLOR[item.submission_type] || "default"} style={{ margin: 0, flexShrink: 0 }}>
            {typeLabel(item.submission_type, t)}
          </Tag>
          <Text strong style={{ fontSize: 14, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </Text>
          {brand && (
            <Text style={{ fontSize: 13, color: "var(--neu-text-2)", flexShrink: 0 }}>· {brand}</Text>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Tag color={STATUS_COLOR[item.status] || "default"} style={{ margin: 0 }}>
            {statusLabel(item.status, t)}
          </Tag>
          <Text style={{ fontSize: 12, color: "var(--neu-text-2)" }}>
            {item.submitted_at ? dayjs(item.submitted_at).format("YYYY-MM-DD") : ""}
          </Text>
        </div>
      </div>

      {item.notes && (
        <Text style={{ fontSize: 13, color: "var(--neu-text-2)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.notes}
        </Text>
      )}
    </div>
  );
}

function SubmissionDrawer({ item, onClose, t }) {
  if (!item) return null;
  const title = item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—";
  const brand = item.brand_name || item.custom_brand_name;

  return (
    <Drawer
      open={!!item}
      onClose={onClose}
      width={400}
      title={<span style={{ fontSize: 14, fontWeight: 500, color: "var(--neu-text)" }}>{title}</span>}
      destroyOnClose
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Tag color={TYPE_COLOR[item.submission_type] || "default"} style={{ margin: 0 }}>
            {typeLabel(item.submission_type, t)}
          </Tag>
          <Tag color={STATUS_COLOR[item.status] || "default"} style={{ margin: 0 }}>
            {statusLabel(item.status, t)}
          </Tag>
        </div>
        <Text style={{ fontSize: 12, color: "var(--neu-text-2)" }}>
          {item.submitted_at ? dayjs(item.submitted_at).format("YYYY-MM-DD HH:mm") : ""}
        </Text>
      </div>

      <DetailRow label={t("nameEn")} value={item.name_en} />
      <DetailRow label={t("nameZh")} value={item.name_zh} />
      <DetailRow label={t("brand")} value={brand} />
      <DetailRow label={t("scale")} value={item.scale} />
      <DetailRow label={t("notes")} value={item.notes} />

      {item.image_url && (
        <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}>
          <span style={{ color: "var(--neu-text-2)", fontSize: 13, display: "block", marginBottom: 8 }}>{t("image")}</span>
          <div
            onClick={() => window.open(item.image_url, "_blank")}
            style={{ display: "inline-block", borderRadius: 10, overflow: "hidden", boxShadow: "var(--raised-sm)", cursor: "pointer", lineHeight: 0 }}
          >
            <img
              src={item.image_url}
              alt="attachment"
              style={{ display: "block", maxWidth: "100%", maxHeight: 260, objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {item.admin_note && (
        <div style={{ marginTop: 16, borderRadius: 10, padding: "10px 14px", boxShadow: "var(--inset-sm)", borderLeft: "3px solid var(--neu-accent)" }}>
          <Text style={{ fontSize: 11, color: "var(--neu-text-2)", display: "block", marginBottom: 3, fontWeight: 600, letterSpacing: "0.3px" }}>
            {t("adminReply")}
          </Text>
          <Text style={{ fontSize: 13, color: "var(--neu-text)" }}>{item.admin_note}</Text>
        </div>
      )}

      {item.reject_reason && (
        <div style={{ marginTop: 16, borderRadius: 10, padding: "10px 14px", boxShadow: "var(--inset-sm)", borderLeft: "3px solid var(--neu-danger)" }}>
          <Text style={{ fontSize: 11, color: "var(--neu-text-2)", display: "block", marginBottom: 3, fontWeight: 600, letterSpacing: "0.3px" }}>
            {t("rejectionReason")}
          </Text>
          <Text style={{ fontSize: 13, color: "var(--neu-text)" }}>{item.reject_reason}</Text>
        </div>
      )}
    </Drawer>
  );
}

export default function FeedbackPage() {
  const { message } = App.useApp(); const { t } = useLocale();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMySubmissions();
      setSubmissions(Array.isArray(data) ? data.slice().reverse() : []);
    } catch (err) {
      message.error(err?.message || t("failedToLoadMySubmissions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getBrands().then((data) => setBrands(Array.isArray(data) ? data : [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitSuccess = () => {
    setSubmitModalVisible(false);
    load();
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={load} disabled={loading} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setSubmitModalVisible(true)}>
            {t("newFeedback")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : submissions.length === 0 ? (
        <Empty description={t("myFeedbackEmpty")} style={{ padding: 48 }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {submissions.map((item) => (
            <SubmissionCard key={item.id} item={item} t={t} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}

      <SubmissionDrawer item={selectedItem} onClose={() => setSelectedItem(null)} t={t} />

      <SubmitObjectModal
        visible={submitModalVisible}
        onCancel={handleSubmitSuccess}
        selectedBrand={null}
        brands={brands}
      />
    </div>
  );
}
