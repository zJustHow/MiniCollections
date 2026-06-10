import PlusOutlined from "@ant-design/icons/es/icons/PlusOutlined.js";
import ReloadOutlined from "@ant-design/icons/es/icons/ReloadOutlined.js";
import FeedbackCardSkeleton from "./FeedbackCardSkeleton";
import { useLocale } from "../LocaleContext";

function FeedbackToolbarButtonSkeleton({
  className = "",
  icon,
  label,
}) {
  return (
    <span
      className={["ant-btn neu-btn neu-feedback-page-skeleton-btn", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {icon ? <span className="ant-btn-icon">{icon}</span> : null}
      {label ? (
        <span className="neu-feedback-page-skeleton-btn-label">{label}</span>
      ) : null}
      <span className="neu-card-skeleton-line neu-feedback-page-skeleton-btn-fill" />
    </span>
  );
}

export const DEFAULT_FEEDBACK_SKELETON_COUNT = 5;

export function FeedbackListSkeleton({
  count = DEFAULT_FEEDBACK_SKELETON_COUNT,
}) {
  return (
    <div className="neu-feedback-page-skeleton-list" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <FeedbackCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function FeedbackPageSkeleton({
  showToolbar = true,
  count = DEFAULT_FEEDBACK_SKELETON_COUNT,
}) {
  const { t } = useLocale();

  return (
    <div
      className="neu-feedback-page-skeleton"
      style={{ maxWidth: 720, margin: "0 auto" }}
      aria-busy="true"
    >
      {showToolbar ? (
        <div className="neu-feedback-page-skeleton-toolbar">
          <FeedbackToolbarButtonSkeleton
            className="ant-btn-default ant-btn-icon-only"
            icon={<ReloadOutlined />}
          />
          <FeedbackToolbarButtonSkeleton
            className="ant-btn-primary"
            icon={<PlusOutlined />}
            label={t("newFeedback")}
          />
        </div>
      ) : null}
      <FeedbackListSkeleton count={count} />
    </div>
  );
}
