import { App, Empty, Spin, Typography } from "antd";
import NeuTag from "../components/NeuTag";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import NeuButton from "../components/NeuButton";
import NeuCard, { NeuCardImageSlot } from "../components/NeuCard";
import ListPagination from "../components/ListPagination";
import usePagedList from "../hooks/usePagedList";
import { useLocale } from "../LocaleContext";
import { radius } from "../theme/radius";
import { deleteMySubmission, getMySubmissionsPage, FEEDBACK_PAGE_SIZE } from "../utils";
import SubmitObjectModal from "../components/ObjectList/modals/SubmitObjectModal";
import NeuFormDrawer from "../components/NeuFormDrawer";
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
      <span style={{ color: "var(--neu-text)", fontSize: 13 }}>{value}</span>
    </div>
  );
}

function SubmissionCard({ item, t, onClick }) {
  const title = item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—";
  const brand = item.brand_name || item.custom_brand_name;

  return (
    <NeuCard variant="row" onClick={onClick}>
      {item.image_url ? (
        <NeuCardImageSlot slot="thumb" imageUrl={item.image_url} alt={title} />
      ) : null}
      <div className="neu-card-row-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
            <NeuTag color={TYPE_COLOR[item.submission_type] || "default"}>
              {typeLabel(item.submission_type, t)}
            </NeuTag>
            <Text strong style={{ fontSize: 14, color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title}
            </Text>
            {brand && (
              <Text style={{ fontSize: 13, color: "var(--neu-text-2)", flexShrink: 0 }}>· {brand}</Text>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <NeuTag color={STATUS_COLOR[item.status] || "default"}>
              {statusLabel(item.status, t)}
            </NeuTag>
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
    </NeuCard>
  );
}

function SubmissionDrawer({ item, onClose, onDelete, t }) {
  if (!item) return null;
  const title = item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—";
  const brand = item.brand_name || item.custom_brand_name;

  return (
    <NeuFormDrawer
      title={title}
      open={!!item}
      onClose={onClose}
      onDelete={() => onDelete(item)}
      deleteLabel={t("delete")}
      destroyOnClose
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NeuTag color={TYPE_COLOR[item.submission_type] || "default"}>
            {typeLabel(item.submission_type, t)}
          </NeuTag>
          <NeuTag color={STATUS_COLOR[item.status] || "default"}>
            {statusLabel(item.status, t)}
          </NeuTag>
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
            style={{ display: "inline-block", borderRadius: radius.md, overflow: "hidden", boxShadow: "var(--raised-sm)", cursor: "pointer", lineHeight: 0 }}
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
        <div style={{ marginTop: 16, borderRadius: radius.md, padding: "10px 14px", boxShadow: "var(--inset)", borderLeft: "3px solid var(--neu-accent)" }}>
          <Text style={{ fontSize: 11, color: "var(--neu-text-2)", display: "block", marginBottom: 3, letterSpacing: "0.3px" }}>
            {t("adminReply")}
          </Text>
          <Text style={{ fontSize: 13, color: "var(--neu-text)" }}>{item.admin_note}</Text>
        </div>
      )}

      {item.reject_reason && (
        <div style={{ marginTop: 16, borderRadius: radius.md, padding: "10px 14px", boxShadow: "var(--inset)", borderLeft: "3px solid var(--neu-danger)" }}>
          <Text style={{ fontSize: 11, color: "var(--neu-text-2)", display: "block", marginBottom: 3, letterSpacing: "0.3px" }}>
            {t("rejectionReason")}
          </Text>
          <Text style={{ fontSize: 13, color: "var(--neu-text)" }}>{item.reject_reason}</Text>
        </div>
      )}
    </NeuFormDrawer>
  );
}

export default function FeedbackPage() {
  const { message, modal } = App.useApp(); const { t } = useLocale();
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchMySubmissionsPage = useCallback(async ({ page, size }) => {
    try {
      return await getMySubmissionsPage({ page, size });
    } catch (err) {
      message.error(err?.message || t("failedToLoadMySubmissions"));
      return { content: [], page: 0, total_pages: 0, total_elements: 0 };
    }
  }, [message, t]);

  const {
    items: submissions,
    page,
    totalPages,
    loading,
    loadPage,
    onPageChange,
  } = usePagedList(fetchMySubmissionsPage, { pageSize: FEEDBACK_PAGE_SIZE });

  const handleSubmitSuccess = () => {
    setSubmitModalVisible(false);
    loadPage(0);
  };

  const handleDelete = (item) => {
    modal.confirm({
      title: t("deleteFeedbackTitle"),
      content: t("deleteFeedbackContent"),
      okText: t("delete"),
      okType: "danger",
      cancelText: t("cancel"),
      onOk: async () => {
        try {
          await deleteMySubmission(item.id);
          message.success(t("feedbackDeleted"));
          setSelectedItem(null);
          loadPage(page);
        } catch (err) {
          message.error(err?.message || t("failedToDeleteFeedback"));
        }
      },
    });
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <NeuButton icon={<ReloadOutlined />} onClick={() => loadPage(page)} disabled={loading} />
          <NeuButton variant="primary" icon={<PlusOutlined />} onClick={() => setSubmitModalVisible(true)}>
            {t("newFeedback")}
          </NeuButton>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : submissions.length === 0 ? (
        <Empty description={t("myFeedbackEmpty")} style={{ padding: 48 }} />
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {submissions.map((item) => (
              <SubmissionCard key={item.id} item={item} t={t} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
          <ListPagination
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPageChange={onPageChange}
            pageSize={FEEDBACK_PAGE_SIZE}
          />
        </>
      )}

      <SubmissionDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDelete}
        t={t}
      />

      <SubmitObjectModal
        visible={submitModalVisible}
        onCancel={handleSubmitSuccess}
        selectedBrand={null}
      />
    </div>
  );
}
