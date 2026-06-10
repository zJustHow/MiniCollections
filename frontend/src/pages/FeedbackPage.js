import { App, Typography } from "antd";
import NoDataPlaceholder from "../components/NoDataPlaceholder";
import NeuTag from "../components/NeuTag";
import PlusOutlined from "@ant-design/icons/es/icons/PlusOutlined.js";
import ReloadOutlined from "@ant-design/icons/es/icons/ReloadOutlined.js";
import { useCallback, useEffect, useState } from "react";
import NeuButton from "../components/NeuButton";
import NeuCard from "../components/NeuCard";
import ListPagination from "../components/ListPagination";
import usePagedList from "../hooks/usePagedList";
import { useLocale } from "../LocaleContext";
import { radius } from "../theme/radius";
import DetailImage from "../components/DetailImage";
import { FEEDBACK_PAGE_SIZE } from "../utils/apiClient";
import { resolveMediaUrl } from "../utils/constants";
import {
  deleteMySubmission,
  getMySubmissionsPage,
} from "../utils/submissionsApi";
import { createLazyModal } from "../utils/lazyModal";

const SubmitObjectModal = createLazyModal(
  () => import("../components/ObjectList/modals/SubmitObjectModal"),
);
import { FeedbackListSkeleton } from "../components/FeedbackPageSkeleton";
import NeuFormDrawer from "../components/NeuFormDrawer";
import dayjs from "dayjs";
import { neuRem } from "../theme/fontScale";

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
      <span style={{ color: "var(--neu-text-2)", fontSize: neuRem(13), minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--neu-text)", fontSize: neuRem(13) }}>{value}</span>
    </div>
  );
}

function SubmissionCard({ item, t, onClick }) {
  const title = item.name_en || item.name_zh || item.notes?.slice(0, 60) || "—";
  const brand = item.brand_name || item.custom_brand_name;

  return (
    <NeuCard variant="row" onClick={onClick}>
      <div className="neu-card-row-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
            <NeuTag color={TYPE_COLOR[item.submission_type] || "default"}>
              {typeLabel(item.submission_type, t)}
            </NeuTag>
            <Text strong style={{ fontSize: neuRem(14), color: "var(--neu-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title}
            </Text>
            {brand && (
              <Text style={{ fontSize: neuRem(13), color: "var(--neu-text-2)", flexShrink: 0 }}>· {brand}</Text>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <NeuTag color={STATUS_COLOR[item.status] || "default"}>
              {statusLabel(item.status, t)}
            </NeuTag>
            <Text style={{ fontSize: neuRem(12), color: "var(--neu-text-2)" }}>
              {item.submitted_at ? dayjs(item.submitted_at).format("YYYY-MM-DD") : ""}
            </Text>
          </div>
        </div>

        {item.notes && (
          <Text style={{ fontSize: neuRem(13), color: "var(--neu-text-2)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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
        <Text style={{ fontSize: neuRem(12), color: "var(--neu-text-2)" }}>
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
          <span style={{ color: "var(--neu-text-2)", fontSize: neuRem(13), display: "block", marginBottom: 8 }}>{t("image")}</span>
          <DetailImage
            imageUrl={item.image_url}
            alt={title}
            onClick={() => window.open(resolveMediaUrl(item.image_url), "_blank")}
          />
        </div>
      )}

      {item.admin_note && (
        <div style={{ marginTop: 16, borderRadius: radius.md, padding: "10px 14px", boxShadow: "var(--inset)", borderLeft: "3px solid var(--neu-accent)" }}>
          <Text style={{ fontSize: neuRem(11), color: "var(--neu-text-2)", display: "block", marginBottom: 3, letterSpacing: "0.3px" }}>
            {t("adminReply")}
          </Text>
          <Text style={{ fontSize: neuRem(13), color: "var(--neu-text)" }}>{item.admin_note}</Text>
        </div>
      )}

      {item.reject_reason && (
        <div style={{ marginTop: 16, borderRadius: radius.md, padding: "10px 14px", boxShadow: "var(--inset)", borderLeft: "3px solid var(--neu-danger)" }}>
          <Text style={{ fontSize: neuRem(11), color: "var(--neu-text-2)", display: "block", marginBottom: 3, letterSpacing: "0.3px" }}>
            {t("rejectionReason")}
          </Text>
          <Text style={{ fontSize: neuRem(13), color: "var(--neu-text)" }}>{item.reject_reason}</Text>
        </div>
      )}
    </NeuFormDrawer>
  );
}

export default function FeedbackPage() {
  const { message } = App.useApp(); const { t } = useLocale();
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

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

  useEffect(() => {
    if (!loading) setInitialLoaded(true);
  }, [loading]);

  const showInitialSkeleton = !initialLoaded;

  const handleSubmitSuccess = () => {
    setSubmitModalVisible(false);
    loadPage(0);
  };

  const handleDelete = async (item) => {
    try {
      await deleteMySubmission(item.id);
      message.success(t("feedbackDeleted"));
      setSelectedItem(null);
      loadPage(page);
    } catch (err) {
      message.error(err?.message || t("failedToDeleteFeedback"));
    }
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

      {showInitialSkeleton ? (
        <FeedbackListSkeleton />
      ) : submissions.length === 0 ? (
        <NoDataPlaceholder />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {submissions.map((item) => (
            <SubmissionCard key={item.id} item={item} t={t} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      )}
      {!showInitialSkeleton && submissions.length > 0 && (
        <ListPagination
          page={page}
          totalPages={totalPages}
          loading={loading}
          onPageChange={onPageChange}
          pageSize={FEEDBACK_PAGE_SIZE}
        />
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
