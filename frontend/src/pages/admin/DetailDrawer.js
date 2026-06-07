import { CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import NeuTag from "../../components/NeuTag";
import { useState } from "react";
import { useLocale } from "../../LocaleContext";
import NeuFormDrawer from "../../components/NeuFormDrawer";
import HeaderActionButton from "../../components/HeaderActionButton";
import { radius } from "../../theme/radius";
import { STATUS_COLOR, TYPE_COLOR, useStatusLabel, useTypeLabel } from "./constants";
import { neuRem } from "../../theme/fontScale";

export default function DetailDrawer({ submission, onClose, onApprove, onResolve, onReject }) {
  const { t } = useLocale();
  const getTypeLabel = useTypeLabel(t);
  const getStatusLabel = useStatusLabel(t);
  const [imgHovered, setImgHovered] = useState(false);
  if (!submission) return null;

  const isMissingModel = submission.submission_type === "MISSING_MODEL";

  const rows = [
    { label: t("submitter"), value: submission.submitter_name },
    { label: t("submissionType"), value: getTypeLabel(submission.submission_type) },
    ...(isMissingModel
      ? [
          { label: t("brand"), value: submission.brand_name },
          { label: t("nameEn"), value: submission.name_en },
          { label: t("nameZh"), value: submission.name_zh },
          { label: t("scale"), value: submission.scale },
          { label: t("category"), value: submission.category_en },
          { label: t("releaseDate"), value: submission.release_date },
          { label: t("series"), value: submission.series_en },
          { label: t("priceCNY"), value: submission.release_price_cny },
          { label: t("priceUSD"), value: submission.release_price_usd },
          { label: t("additionalNotes"), value: submission.notes },
        ]
      : [
          { label: t("bugSubject"), value: submission.name_en },
          { label: t("bugDescription"), value: submission.notes },
          ...(submission.submission_type === "DATA_CORRECTION"
            ? [{ label: t("brand"), value: submission.brand_name }]
            : []),
        ]),
    { label: t("adminNote"), value: submission.admin_note },
    { label: t("rejectReason"), value: submission.reject_reason },
  ];

  return (
    <NeuFormDrawer
      title={`#${submission.id} — ${submission.name_en || submission.notes?.slice(0, 40) || "—"}`}
      open={!!submission}
      onClose={onClose}
      destroyOnClose
      trailing={
        submission.status === "PENDING" ? (
          <>
            <HeaderActionButton
              icon={<CheckOutlined />}
              onClick={isMissingModel ? onApprove : onResolve}
              aria-label={
                isMissingModel ? t("approveSubmission") : t("resolveSubmission")
              }
            />
            <HeaderActionButton
              danger
              icon={<DeleteOutlined />}
              onClick={onReject}
              aria-label={
                isMissingModel ? t("rejectSubmission") : t("closeSubmission")
              }
            />
          </>
        ) : null
      }
    >
      {submission.image_url && (
        <div
          onClick={() => window.open(submission.image_url, "_blank")}
          onMouseEnter={() => setImgHovered(true)}
          onMouseLeave={() => setImgHovered(false)}
          style={{
            position: "relative",
            marginBottom: 16,
            borderRadius: radius.md,
            overflow: "hidden",
            boxShadow: "var(--raised-sm)",
            cursor: "pointer",
            lineHeight: 0,
          }}
        >
          <img
            src={submission.image_url}
            alt={submission.name_en}
            style={{
              width: "100%",
              maxHeight: 220,
              objectFit: "contain",
              display: "block",
              background: "rgba(0,0,0,0.03)",
              transition: "transform 0.2s",
              transform: imgHovered ? "scale(1.02)" : "scale(1)",
            }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: imgHovered ? 1 : 0,
            transition: "opacity 0.2s",
            color: "#fff",
            fontSize: neuRem(13),
            letterSpacing: "0.5px",
            lineHeight: 1,
          }}>
            {t("image")} ↗
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <NeuTag color={TYPE_COLOR[submission.submission_type]}>{getTypeLabel(submission.submission_type)}</NeuTag>
        <NeuTag color={STATUS_COLOR[submission.status]}>{getStatusLabel(submission.status)}</NeuTag>
      </div>
      {rows.map(({ label, value }) =>
        value != null && value !== "" ? (
          <div
            key={label}
            style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(184,182,176,0.2)" }}
          >
            <span style={{ color: "var(--neu-text-2)", fontSize: neuRem(13), minWidth: 120, flexShrink: 0 }}>{label}</span>
            <span style={{ color: "var(--neu-text)", fontSize: neuRem(13), whiteSpace: "pre-wrap" }}>{String(value)}</span>
          </div>
        ) : null
      )}
    </NeuFormDrawer>
  );
}
